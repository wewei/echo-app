
// split text by paragraph
export const splitTextByParagraph = (text: string, maxLength: number = 200, sep = "\n\n"): string[] => {
  const textArray = text.split(sep).filter((t) => t.trim() !== "");
  const result = [];
  let currentTexts = [];
  let currentTextLength = 0;

  for (let i = 0; i < textArray.length; i++) {
    currentTexts.push(textArray[i]);
    currentTextLength += textArray[i].length;
    if (currentTextLength > maxLength) {
      result.push(currentTexts.join(sep));
      currentTexts = [];
      currentTextLength = 0;
    }
  }

  if (currentTexts.length > 0) {
    if (currentTextLength <= 50) {
      if (result.length > 0) {
        currentTexts.unshift(result.pop());
        result.push(currentTexts.join(sep));
      } else {
        result.push(currentTexts.join(sep));
      }
    } else {
      result.push(currentTexts.join(sep));
    }
  }

  return result;
};