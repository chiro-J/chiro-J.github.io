import TextType from "./TextType";

export default function Hero() {
  return (
    <TextType
      text={[
        "관찰에서 시작해 구현으로 \n더 좋은 경험을 완성시키는 개발자",
        "사용자의 행동을 관찰하고, 불편을 발견하며, \n기술로 해결하는 개발자 장철호입니다. ",
        "풀스택 + beyond 개발자를 꿈꾸는 \n프론트엔드 개발자입니다.",
      ]}
      typingSpeed={100}
      pauseDuration={3000}
      showCursor={true}
      cursorCharacter="|"
    />
  );
}
