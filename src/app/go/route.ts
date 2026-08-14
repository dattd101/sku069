import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

// Cần Node.js runtime vì code sử dụng hệ thống file.
export const runtime = "nodejs";

// Không cache kết quả vì mỗi yêu cầu có cookie riêng.
export const dynamic = "force-dynamic";

const LINK_INDEX_COOKIE = "visitor_link_index";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 năm

/**
 * Đọc và kiểm tra danh sách link.
 *
 * Chỉ chấp nhận URL sử dụng http hoặc https để tránh
 * những giao thức không an toàn như javascript:.
 */
function parseLinks(fileContent: string): string[] {
  return fileContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith("#"))
    .filter((line) => {
      try {
        const url = new URL(line);

        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    });
}

/**
 * Lấy vị trí link hiện tại của trình duyệt.
 *
 * Người dùng mới sẽ được chọn một vị trí khởi đầu ngẫu nhiên,
 * giúp các khách mới không phải lúc nào cũng vào link đầu tiên.
 */
function getCurrentIndex(
  savedIndex: string | undefined,
  numberOfLinks: number,
): number {
  if (!savedIndex) {
    return Math.floor(Math.random() * numberOfLinks);
  }

  const parsedIndex = Number.parseInt(savedIndex, 10);

  if (!Number.isInteger(parsedIndex) || parsedIndex < 0) {
    return 0;
  }

  return parsedIndex % numberOfLinks;
}

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "db", "link.txt");
    const fileContent = await readFile(filePath, "utf8");
    const links = parseLinks(fileContent);

    if (links.length === 0) {
      return NextResponse.json(
        {
          error:
            "File db/link.txt không có link http hoặc https hợp lệ.",
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const savedIndex = request.cookies.get(LINK_INDEX_COOKIE)?.value;

    const currentIndex = getCurrentIndex(
      savedIndex,
      links.length,
    );

    const targetUrl = new URL(links[currentIndex]);

    // Lần truy cập sau sẽ dùng link tiếp theo.
    const nextIndex = (currentIndex + 1) % links.length;

    // 307 là chuyển hướng tạm thời.
    const response = NextResponse.redirect(targetUrl, 307);

    response.cookies.set({
      name: LINK_INDEX_COOKIE,
      value: String(nextIndex),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch (error) {
    console.error("Không thể đọc db/link.txt:", error);

    return NextResponse.json(
      {
        error: "Không thể đọc file db/link.txt.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}