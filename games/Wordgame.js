import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSettings } from "../context/SettingsContext";

/**
 * @typedef {{ id: string, before: string, after: string, answer: string, alt?: string[] }} BlankPuzzle
 */
//answer key

const PUZZLE_BANK = [
  {
    id: "glass",
    before: "Clean bottles and jars made of ",
    after: " go in the glass recycling stream.",
    answer: "glass",
  },
  {
    id: "plastic",
    before: "Many drink bottles are made of ",
    after: " that need to be rinsed before recycling.",
    answer: "plastic",
  },
  {
    id: "metal",
    before: "Aluminium drink cans belong with ",
    after: " recycling.",
    answer: "metal",
  },
  {
    id: "paper",
    before: "Clean cardboard and ",
    after: " can often be recycled if it is not greasy.",
    answer: "paper",
  },
  {
    id: "organic",
    before: "Food scraps and peels are ",
    after: " waste, They should be thrown in the general waste.",
    answer: "organic",
    alt: ["food"],
  },
  {
    id: "recycle",
    before: "The three R’s: reduce, reuse, and ",
    after: ".",
    answer: "recycle",
  },
  {
    id: "landfill",
    before: "Non-recyclable rubbish usually ends up in a ",
    after: ".",
    answer: "landfill",
  },
  {
    id: "contamination",
    before: "Food or liquids in a recycling bin cause ",
    after: " and can spoil a whole batch.",
    answer: "contamination",
  },
  {
    id: "conserve",
    before: "Sorting waste correctly helps ",
    after: " resources and energy.",
    answer: "conserve",
    alt: ["save"],
  },
  {
    id: "singapore",
    before: "In ",
    after: ", public recycling bins use blue labels for common recyclables.",
    answer: "singapore",
  },

  {
    id: "toxic",
    before: "Batteries and e-waste can be ",
    answer: "toxic",
    after: " .Dispose it at e-waste bins",
    alt: ["hazardous"],
  },
  {
    id: "reuse",
    before: "Using a water bottle again instead of tossing it is an example of ",
    after: ".",
    answer: "reuse",
  },
  {
    id: "reduce",
    before: "Buying only what you need helps ",
    answer: "reduce",
    after: " packaging waste at the source.",
  },
];

const ROUNDSIZE = 6;
const BONUS_POINTS = 20;

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function normalize(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function isCorrect(puzzle, rawInput) {
  const input = normalize(rawInput);
  if (!input) return false;
  if (input === normalize(puzzle.answer)) return true;
  if (puzzle.alt?.some((a) => input === normalize(a))) return true;
  return false;
}

// fill in the blanks game
export default function FillInBlanksGame({ onBack, onEarnPoints }) {
  const { fontScale, theme } = useSettings();
  const isLight = theme === "light";

  const [round, setRound] = useState(() => shuffle(PUZZLE_BANK).slice(0, ROUNDSIZE));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [score, setScore] = useState(0);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  const puzzle = round[index];
  const done = index >= round.length;

  const progressLabel = useMemo(() => {
    if (!puzzle || done) return "";
    return `Question ${index + 1} of ${round.length}`;
  }, [puzzle, index, round.length, done]);

  useEffect(() => {
    if (done && !pointsAwarded && typeof onEarnPoints === "function") {
      onEarnPoints(BONUS_POINTS);
      setPointsAwarded(true);
    }
  }, [done, pointsAwarded, onEarnPoints]);

  const checkAnswer = async () => {
    if (!puzzle || feedback === "correct") return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isCorrect(puzzle, input)) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback("correct");
      setScore((s) => s + 1);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback("wrong");
    }
  };

  const nextOrFinish = async () => {
    await Haptics.selectionAsync();
    setFeedback(null);
    setInput("");
    setIndex((i) => i + 1);
  };

  const restartRound = () => {
    setRound(shuffle(PUZZLE_BANK).slice(0, ROUNDSIZE));
    setIndex(0);
    setInput("");
    setFeedback(null);
    setScore(0);
    setPointsAwarded(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, isLight && styles.containerLight]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        accessible
        accessibilityLabel="Fill in the blanks recycling game"
      >
        <Pressable
          style={[styles.backRow, isLight && styles.backRowLight]}
          onPress={async () => {
            await Haptics.selectionAsync();
            onBack && onBack();
          }}
        >
          <Text style={[styles.backText, isLight && styles.backTextLight, { fontSize: 14 * fontScale }]}>
           𑣲⋆｡˚Back to games
          </Text>
        </Pressable>

        <Text
          style={[styles.title, isLight && styles.titleLight, { fontSize: 18 * fontScale }]}
        >
          Fill in the blanks!
        </Text>
        <Text style={[styles.sub, isLight && styles.subLight, { fontSize: 13 * fontScale }]}>
          Guess the missing word! Hint: its about recycling .✦ ݁˖
        </Text>

        {!done && puzzle && (
          <>
            <Text style={[styles.progress, isLight && styles.progressLight, { fontSize: 12 * fontScale }]}>
              {progressLabel}
            </Text>

            <View style={[styles.card, isLight && styles.cardLight]}>
              <Text style={[styles.sentence, isLight && styles.sentenceLight, { fontSize: 16 * fontScale }]}>
                {puzzle.before}
                <Text style={styles.blankSlot}> ___ </Text>
                {puzzle.after}
              </Text>

              <TextInput
                style={[
                  styles.input,
                  isLight && styles.inputLight,
                  { fontSize: 16 * fontScale },
                ]}
                value={input}
                onChangeText={(t) => {
                  setInput(t);
                  if (feedback) setFeedback(null);
                }}
                placeholder="Answer here"
                placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                autoCapitalize="none"
                autoCorrect={false}
                editable={feedback !== "correct"}
                onSubmitEditing={checkAnswer}
                returnKeyType="done"
                accessibilityLabel="Answer for the blank"
              />

              {feedback === "wrong" && (
                <Text style={[styles.hintWrong, { fontSize: 13 * fontScale }]}>
                  Not quite, try again .✦ ݁˖
                </Text>
              )}
              {feedback === "correct" && (
                <Text style={[styles.hintOk, { fontSize: 13 * fontScale }]}>Correct! ✓</Text>
              )}

              <View style={styles.btnRow}>
                {feedback !== "correct" ? (
                  <Pressable style={styles.primaryBtn} onPress={checkAnswer}>
                    <Text style={styles.primaryBtnText}>Check answer</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.primaryBtn} onPress={nextOrFinish}>
                    <Text style={styles.primaryBtnText}>
                      {index + 1 >= round.length ? "See results" : "Next question"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            <Text style={[styles.scoreLine, isLight && styles.scoreLineLight, { fontSize: 13 * fontScale }]}>
              Correct this round: {score} / {round.length}
            </Text>
          </>
        )}

        {done && (
          <View style={[styles.card, isLight && styles.cardLight]}>
            <Text style={[styles.doneTitle, isLight && styles.doneTitleLight, { fontSize: 20 * fontScale }]}>
              Round complete!
            </Text>
            <Text style={[styles.doneSub, isLight && styles.doneSubLight, { fontSize: 14 * fontScale }]}>
              You completed all {round.length} prompts. +{BONUS_POINTS} bonus points!
            </Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                restartRound();
              }}
            >
              <Text style={styles.primaryBtnText}>New round</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#020617",
  },
  containerLight: {
    backgroundColor: "#f1f5f9",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  backRow: {
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 6,
  },
  backRowLight: {},
  backText: {
    color: "#93c5fd",
    fontWeight: "700",
  },
  backTextLight: {
    color: "#2563eb",
  },
  title: {
    color: "#f8fafc",
    fontWeight: "800",
    marginBottom: 4,
  },
  titleLight: {
    color: "#020617",
  },
  sub: {
    color: "#94a3b8",
    marginBottom: 16,
    lineHeight: 20,
  },
  subLight: {
    color: "#64748b",
  },
  progress: {
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 10,
  },
  progressLight: {
    color: "#475569",
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  sentence: {
    color: "#e2e8f0",
    lineHeight: 26,
    marginBottom: 16,
  },
  sentenceLight: {
    color: "#0f172a",
  },
  blankSlot: {
    fontWeight: "800",
    color: "#f472b6",
  },
  input: {
    borderWidth: 2,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#f8fafc",
    backgroundColor: "#020617",
    marginBottom: 12,
  },
  inputLight: {
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#020617",
  },
  hintWrong: {
    color: "#fca5a5",
    marginBottom: 12,
  },
  hintOk: {
    color: "#86efac",
    fontWeight: "700",
    marginBottom: 12,
  },
  btnRow: {
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: "pink",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#020617",
    fontWeight: "800",
    fontSize: 16,
  },
  scoreLine: {
    color: "#94a3b8",
    marginTop: 14,
    textAlign: "center",
  },
  scoreLineLight: {
    color: "#64748b",
  },
  doneTitle: {
    color: "#f8fafc",
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  doneTitleLight: {
    color: "#020617",
  },
  doneSub: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  doneSubLight: {
    color: "#64748b",
  },
});
