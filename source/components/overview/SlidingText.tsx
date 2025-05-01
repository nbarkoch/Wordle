import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, StyleSheet, Text} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import {useScoreStore} from '~/store/useScore';
import {colors} from '~/utils/colors';

interface RotatingGradientTextProps {
  defaultTitle?: string;
  rotationInterval?: number;
}

const proJokes = [
  'לא נמאס לך לנצח כל הזמן?',
  'חאלס, מספיק שברת לנו את המשחק',
  'האקדמיה ללשון העברית רוצה לדעת את המיקום שלך..',
  'הלוואי שהיית מפציץ ככה בלוטו, לא סתם תקוע פה איתי..',
  'אתה עושה לנו בושות מול שאר המשתמשים..',
  'חבל שהכישרון הזה לא עוזר לך במציאת חנייה..',
  'כשנגמרות המילים בעברית, נעבור לארמית בשבילך',
  'איך אתה שולף ככה מילים? יש לך לפרקון בפלאפון?',
  'יש לך עוד מהחומר הזה שאתה לוקח?',
];

const jokes = [
  'אכלת מילון לארוחת בוקר?',
  'גם אנחנו לא ידענו את המילה הזאת, לקחנו מגוגל..',
  'המילה הסודית הבאה היא "חרצוץ"',
  "כל מילה בסלע, חוץ מהמילה 'סלע'",
  // 'הידעת? אם תלחץ חזק על האותיות, תוכל לשמוע את המילה',
  // 'מה משותף לך ולחתול? שניכם לא יודעים לשחק',
  // 'אתה כל כך גרוע במשחק הזה, אפילו הטעויות שלך עושות טעויות',
  'הידעת? אם תנחש מהר, יש סיכוי שתטעה מהר יותר',
  'הידעת? אם תנחש את המילה בעיניים עצומות, תראה חושך',
  'אתה לא טועה, אתה פשוט מגלה דרכים חדשות לא להגיע לפתרון',
];

const defaultTitles = [
  'משחק ניחוש מילים בעברית',
  'משחק ניחוש מילים בעברית',
  'משחק ניחוש מילים בעברית',
  'משחק ניחוש מילים בעברית',
  'משחק ניחוש מילים בעברית',
  'משחק ניחוש מילים בעברית',
  'משחק ניחוש מילים בעברית',
  'אתגר לשוני לחובבי מילים',
  'שחק ושפר את אוצר המילים שלך',
  'כל מילה היא ניצחון קטן',
  'משחק המילים המוביל בישראל',
];

const gameTips = [
  "הרבה מהמילים משתמשות באותיות 'ה' 'ו' ו-'י'",
  'לחץ על אותיות בצבע צהוב לרמז',
  'השתמש ברמזים לפתרון מילים קשות',
  'נסה מילים מקטגוריות שונות',
  'נחש את המילה במינימום ניסיונות',
];

const getTitles = (userScore: number) => {
  const $feedback = [`צברת ${userScore} נקודות עד כה`];
  const $jokes = [];

  if (userScore > 50) {
    $feedback.push('ממשיך לנצח! כל הכבוד');
    $feedback.push('התקדמות מרשימה!');
    $jokes.push(...jokes);
  }

  if (userScore > 100) {
    $feedback.push('מנחש מילים מקצועי!');
    $feedback.push('המילים נכנעות בפניך!');
    $jokes.push(...proJokes);
  }

  if (userScore > 200) {
    $feedback.push('אלוף המילים! מדהים');
    $feedback.push('מאסטר הניחושים!');
    $feedback.push('גאון לשוני אמיתי!');
  }

  if (userScore > 500) {
    $feedback.push('אגדת וורדל חיה!');
    $feedback.push('מלך הוורדל!');
  }

  return {feedback: $feedback, jokes: $jokes};
};

const {width} = Dimensions.get('screen');

const SlidingText: React.FC<RotatingGradientTextProps> = ({
  defaultTitle = 'משחק ניחוש מילים בעברית',
  rotationInterval = 7000,
}) => {
  const [currentTitle, setCurrentTitle] = useState(defaultTitle);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const {userScore} = useScoreStore();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{translateX: translateX.value}],
    };
  });

  const categoryIndexRef = useRef(0);

  const changeTitle = useCallback(() => {
    const {jokes: userJokes, feedback} = getTitles(userScore);

    const categories = [defaultTitles, gameTips, feedback, userJokes];

    const total = categories.length;
    let index = categoryIndexRef.current;

    // Try each category up to 4 times (max)
    for (let i = 0; i < total; i++) {
      const titles = categories[index];
      index = (index + 1) % total;

      if (!titles || titles.length === 0) {
        continue;
      }

      const options = titles.filter(t => t !== currentTitle);
      const newTitle =
        options.length > 0
          ? options[Math.floor(Math.random() * options.length)]
          : titles[0];

      categoryIndexRef.current = index;
      setCurrentTitle(newTitle);
      return;
    }
  }, [currentTitle, userScore]);

  const animateTransition = useCallback(() => {
    // Use a more elegant slide-up and fade animation
    opacity.value = withSequence(
      withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      }),
      withTiming(1, {
        duration: 600,
        easing: Easing.in(Easing.ease),
      }),
    );

    // Slide text slightly upward on exit and downward on entrance
    translateX.value = withSequence(
      withTiming(
        -width * 0.25,
        {
          duration: 400,
          easing: Easing.out(Easing.ease),
        },
        () => {
          // Change the title at the midpoint of the animation
          runOnJS(changeTitle)();
        },
      ),
      withTiming(width * 0.25, {
        duration: 0,
      }),
      withTiming(0, {
        duration: 400,
        easing: Easing.in(Easing.ease),
      }),
    );
  }, [changeTitle, opacity, translateX]);

  useEffect(() => {
    const interval = setInterval(() => {
      animateTransition();
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [rotationInterval, currentTitle, userScore, animateTransition]);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.title}>{currentTitle}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    minHeight: 80,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PloniDL1.1AAA-Bold',
    color: colors.white,
    textAlign: 'center',
  },
});

export default SlidingText;
