import React from "react";
import { useTheme } from "./useTheme";

interface LocationPermissionDialogProps {
  show: boolean;
  onRetry: () => void;
  onDismiss: () => void;
  locationMethod?: "gps" | "ip" | "fallback";
  cityInfo?: string;
}

export const LocationPermissionDialog: React.FC<
  LocationPermissionDialogProps
> = ({ show, onRetry, onDismiss, locationMethod = "ip", cityInfo }) => {
  const { currentTheme } = useTheme();

  if (!show) return null;

  const dialogStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  };

  const contentStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${currentTheme.colors.background.start}E6, ${currentTheme.colors.background.end}E6)`,
    backdropFilter: "blur(20px)",
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: "24px",
    padding: "32px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    color: currentTheme.colors.text.primary,
    position: "relative",
    overflow: "hidden",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "14px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
    color: "white",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "rgba(255, 255, 255, 0.15)",
    color: currentTheme.colors.text.primary,
    border: `1px solid rgba(255, 255, 255, 0.2)`,
  };

  return (
    <div style={dialogStyle} onClick={onDismiss}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {/* 장식적 오버레이 */}
        {currentTheme.colors.overlay && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: currentTheme.colors.overlay,
              pointerEvents: "none",
              borderRadius: "24px",
            }}
          />
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* 헤더 */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🌍</div>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "1.6rem",
                fontWeight: "700",
                backgroundImage: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              더 정확한 날씨 테마를 원하시나요?
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "1rem",
                color: currentTheme.colors.text.secondary,
                lineHeight: 1.5,
              }}
            >
              현재 {locationMethod === "ip" ? "IP 기반" : "대략적"} 위치로
              날씨를 가져오고 있습니다
              {cityInfo && ` (${cityInfo})`}
            </p>
          </div>

          {/* 현재 상태 정보 */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              border: `1px solid rgba(255, 255, 255, 0.15)`,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                fontSize: "14px",
              }}
            >
              <div>
                <div style={{ opacity: 0.8, marginBottom: "4px" }}>
                  현재 상태
                </div>
                <div style={{ fontWeight: "600" }}>
                  {locationMethod === "ip" ? "📍 IP 기반 위치" : "🔍 추정 위치"}
                </div>
              </div>
              <div>
                <div style={{ opacity: 0.8, marginBottom: "4px" }}>정확도</div>
                <div style={{ fontWeight: "600" }}>
                  {locationMethod === "ip" ? "중간 정확도" : "낮은 정확도"}
                </div>
              </div>
            </div>
          </div>

          {/* GPS 허용 시 혜택 */}
          <div style={{ marginBottom: "28px" }}>
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "1.1rem",
                fontWeight: "600",
                color: currentTheme.colors.primary,
              }}
            >
              정확한 위치 허용 시 혜택:
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {[
                { icon: "🎯", text: "현재 위치의 실시간 정확한 날씨" },
                { icon: "🌅", text: "정확한 일출/일몰 시간 반영" },
                { icon: "⚡", text: "지역별 특화 날씨 효과" },
                { icon: "🔄", text: "자동 날씨 변화 감지" },
              ].map((benefit, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 0",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{benefit.icon}</span>
                  <span style={{ fontSize: "0.95rem" }}>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 개인정보 보호 안내 */}
          <div
            style={{
              background: "rgba(52, 152, 219, 0.15)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "28px",
              border: "1px solid rgba(52, 152, 219, 0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>🔒</span>
              <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                개인정보 보호
              </span>
            </div>
            <div style={{ fontSize: "0.85rem", lineHeight: 1.4, opacity: 0.9 }}>
              위치 정보는 날씨 조회에만 사용되며 저장되지 않습니다. 언제든지
              브라우저 설정에서 권한을 취소할 수 있습니다.
            </div>
          </div>

          {/* 버튼들 */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onRetry}
              style={primaryButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(0, 0, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(0, 0, 0, 0.2)";
              }}
            >
              <span>🎯</span>
              정확한 위치 허용
            </button>
            <button
              onClick={onDismiss}
              style={secondaryButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              }}
            >
              현재 상태로 계속
            </button>
          </div>

          {/* 하단 참고 정보 */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              fontSize: "0.8rem",
              color: currentTheme.colors.text.secondary,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            💡 권한을 거부하셔도 IP 기반으로 테마를 계속 즐기실 수 있습니다
          </div>
        </div>
      </div>
    </div>
  );
};
