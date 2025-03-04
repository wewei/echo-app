
// split text by paragraph
export const splitTextByParagraph = (text: string, maxLength: number = 200): string[] => {
  const textArray = text
    .split("\n\n")
    .filter((t) => t.trim() !== "");
  const result = [];
  let curentText = "";
  for (let i = 0; i < textArray.length; i++) {
    if (curentText.length + textArray[i].length < maxLength) {
      curentText += textArray[i] + " ";
    } else {
      result.push(curentText);
      curentText = textArray[i] + " ";
    }
  }

  if(curentText.length <= 50) {
    if(result.length > 0) {
      result[result.length - 1] += curentText;
    } else {
      result.push(curentText);
    }
    return result;
  }
  result.push(curentText);
  return result;
};