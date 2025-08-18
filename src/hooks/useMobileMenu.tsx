import { useState, useEffect, useRef } from "react";

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);
  const openMenu = () => setIsOpen(true);

  // esc 키 눌러서 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 외부 클릭 시 닫기 (햄버거 버튼 제외)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isMenuClick = menuRef.current && menuRef.current.contains(target);
      const isButtonClick =
        buttonRef.current && buttonRef.current.contains(target);

      if (!isMenuClick && !isButtonClick) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // 미디어 쿼리 감지
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
      // 데스크톱으로 변경될 때 메뉴 닫기
      if (!mediaQuery.matches && isOpen) {
        closeMenu();
      }
    };

    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, [isOpen]);

  return {
    isOpen,
    toggleMenu,
    closeMenu,
    openMenu,
    isMobile,
    menuRef,
    buttonRef,
  };
}
