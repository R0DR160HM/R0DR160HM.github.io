const ALL_TEXTS = [
  "HELLO!",
  "BONJOUR!",
  "¡HOLA!",
  "HALLO!",
  "こんにちは！",
  "你好！",
  "CIAO!",
  "안녕하세요!",
  "ПРИВЕТ!",
  "ПРИВІТ!",
  "مرحبًا!",
  "שלום!",
  "ΓΕΙΑ ΣΟΥ!",
];
const currentTexts = [...ALL_TEXTS];

function replaceText() {
  setTimeout(() => {
    if (!currentTexts.length) {
      currentTexts.push("OLÁ!", ...ALL_TEXTS);
    }
    const [randomText] = currentTexts.splice(
      Math.floor(Math.random() * currentTexts.length),
      1
    );
    document.querySelector("h1").innerText = `${randomText} 👋`;
    replaceText();
  }, 10_000);
}

replaceText();
