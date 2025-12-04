import { NovelRequest } from "./types";

export const SYSTEM_PROMPT = `당신은 전문 소설가 AI입니다. 당신의 목표는 몰입감 있고 흥미진진하며 고품질의 웹소설 콘텐츠를 작성하는 것입니다.
일관된 어조와 스타일을 유지하세요. "말하지 말고 보여주라(Show, don't tell)" 원칙을 따르세요. 한국어로 작성하세요.
`;

export function generateInitialPrompt(req: NovelRequest): string {
  return `
    장르: ${req.genre}
    등장인물: ${req.characters.join(", ")}
    줄거리 개요: ${req.plot}
    어조: ${req.tone || "표준"}
    
    위 내용을 바탕으로 소설의 도입부를 작성하세요. 
    분위기를 조성하고 주인공을 소개하세요.
  `;
}

export function generateContinuePrompt(previousContent: string, userInstruction: string): string {
  return `
    이전 내용:
    ${previousContent.slice(-1000)}
    
    사용자 지시: ${userInstruction}
    
    지시에 따라 이야기를 계속 이어나가세요. 흐름을 자연스럽게 유지하세요.
  `;
}
