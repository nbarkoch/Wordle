export type TutorialStep = {
  text: string;
  highlight?: string;
  secondHighlights?: string[];
  displayButton?: boolean;
  position: 'top' | 'center' | 'bottom';
};

export const tutorialSteps: TutorialStep[] = [
  {
    text: 'ברוכים הבאים לוורדל IL!\nמשחק ניחוש מילים מספר אחד בישראל!\nבואו נלמד איך לשחק',
    displayButton: true,
    position: 'center',
  },
  {
    text: 'המטרה היא לנחש את המילה הסודית בפחות מ-6 ניסיונות',
    displayButton: true,
    position: 'center',
  },
  {
    text: 'המילה היא באורך של 5 אותיות',
    displayButton: true,
    position: 'center',
  },
  {
    text: 'ניתן להזין את המילה באמצעות המקלדת מטה',
    highlight: 'keyboard',
    displayButton: true,
    position: 'center',
  },
  {
    text: 'את מה שיוקלד יהיה ניתן לראות בשורה בה המשחק נמצא בפוקוס כעת',
    highlight: 'row-0',
    displayButton: true,
    position: 'center',
  },
  {
    text: "במשחק זה, המילה הסודית היא 'מלכות'",
    displayButton: true,
    position: 'center',
  },
  {
    text: "בוא ננסה לנחש את המילה 'מילות'\nהקלד 'מ'",
    highlight: 'key-מ',
    displayButton: false,
    position: 'center',
  },
  {
    text: "הקלד 'י'",
    highlight: 'key-י',
    displayButton: false,
    position: 'center',
  },
  {
    text: "הקלד 'ל'",
    highlight: 'key-ל',
    displayButton: false,
    position: 'center',
  },
  {
    text: "הקלד 'ו'",
    highlight: 'key-ו',
    displayButton: false,
    position: 'center',
  },
  {
    text: "הקלד 'ת'",
    highlight: 'key-ת',
    displayButton: false,
    position: 'center',
  },
  {
    text: "עכשיו לחץ על כפתור 'אישור' כדי לשלוח את הניחוש",
    highlight: 'submit',
    displayButton: false,
    position: 'center',
  },
  {
    text: 'מעולה!',
    highlight: 'grid',
    displayButton: false,
    position: 'bottom',
  },
  {
    text: 'הצבעים מראים לך כמה קרוב היית למילה הסודית',
    highlight: 'row-0',
    displayButton: true,
    position: 'center',
  },
  {
    text: "ירוק: האות במקום הנכון. האותיות 'מ','ו','ת' הן במקום הנכון!",
    highlight: 'row-0',
    secondHighlights: ['char-00', 'char-03', 'char-04'],
    displayButton: true,
    position: 'center',
  },
  {
    text: "צהוב: האות נמצאת במילה אבל במקום אחר. 'ל' נמצאת במילה אבל במקום אחר.",
    highlight: 'row-0',
    secondHighlights: ['char-02'],
    displayButton: true,
    position: 'center',
  },
  {
    text: "אדום: האות לא נמצאת במילה. 'י' לא נמצאת במילה 'מלכות'.",
    highlight: 'row-0',
    secondHighlights: ['char-01'],
    displayButton: true,
    position: 'center',
  },
  {
    text: 'המשך לנחש עד שתמצא את המילה הסודית או עד שיגמרו הניסיונות',
    highlight: 'row-1',
    displayButton: true,
    position: 'center',
  },
  {
    text: "עכשיו תורך! נסה להשתמש במידע שקיבלת כדי לנחש את המילה 'מלכות'",
    highlight: 'row-1',
    displayButton: true,
    position: 'center',
  },
];
