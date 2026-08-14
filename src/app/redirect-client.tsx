"use client";

import { useEffect, useState } from "react";

const REDIRECT_DELAY_SECONDS = 5;

export default function RedirectClient() {
  const [remainingSeconds, setRemainingSeconds] = useState(
    REDIRECT_DELAY_SECONDS,
  );

  useEffect(() => {
    const countdownId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    const redirectId = window.setTimeout(() => {
      // replace giúp người dùng không bị vòng lặp khi nhấn nút Back.
      window.location.replace("/go");
    }, REDIRECT_DELAY_SECONDS * 1000);

    return () => {
      window.clearInterval(countdownId);
      window.clearTimeout(redirectId);
    };
  }, []);

  function redirectNow() {
    window.location.replace("/go");
  }

  return (
    <div className="redirect-area">
      <p className="countdown">
        Đang chuyển hướng sau{" "}
        <strong>{remainingSeconds}</strong> giây...
      </p>

      <button type="button" onClick={redirectNow}>
        Đi ngay
      </button>

      <noscript>
        <p>
          JavaScript đang bị tắt. <a href="/go">Nhấn vào đây để tiếp tục</a>.
        </p>
      </noscript>
    </div>
  );
}