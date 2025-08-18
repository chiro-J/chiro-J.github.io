import React from "react";
import { useMobileMenu } from "../../hooks/useMobileMenu";
import nameTypho from "../../assets/name_typho-white.png";

export default function Header() {
  const navItems = ["Home", "About", "Tech Stacks", "Work", "Contact"];

  const { isOpen, toggleMenu, menuRef, buttonRef } = useMobileMenu();

  return (
    <nav className="fixed z-50 w-full px-8 py-2 text-white bg-black-800 backdrop-blur-sm">
      <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
        {/* 로고 */}
        <div className="">
          <a href="#">
            <img
              src={nameTypho}
              alt="name_typho"
              className="h-[40px] object-contain"
            />
          </a>
        </div>

        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex gap-8 items-center">
          {navItems.map((item: string) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="transition-all duration-300 hover:text-gray-300 hover:scale-105 font-medium"
            >
              {item}
            </a>
          ))}
        </div>

        {/* 햄버거 버튼 (모바일 용) */}
        <button
          ref={buttonRef}
          className="md:hidden text-white text-2xl transition-transform duration-300 hover:scale-110"
          onClick={toggleMenu}
          aria-label="ToggleMenu"
        >
          <div
            className={`transform transition-transform duration-300 ${
              isOpen ? "rotate-90" : ""
            }`}
          >
            ☰
          </div>
        </button>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ top: "64px" }} // 헤더 높이만큼 아래부터 시작
      />

      {/* 모바일 메뉴 */}
      <div
        ref={menuRef}
        className={`fixed right-0 top-[64px] w-64 bg-black-800 shadow-2xl transform transition-all duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
        style={{
          borderLeft: "1px solid #374151",
          height: "auto",
          minHeight: "fit-content",
        }}
      >
        <div className="flex flex-col pt-6 px-4 pb-6">
          {navItems.map((item: string, index: number) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className={`text-white text-lg font-medium py-3 px-4 border-b border-gray-700 last:border-b-0 transition-all duration-300 hover:bg-gray-800 hover:text-gray-300 transform ${
                isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
              }`}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
              }}
              onClick={toggleMenu}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
