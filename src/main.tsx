import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  CloudSun,
  Copy,
  HeartHandshake,
  MessageCircleHeart,
  Moon,
  RefreshCw,
  SunMedium,
  UsersRound,
} from "lucide-react";
import BorderGlow from "./components/BorderGlow";
import CardNav from "./components/CardNav";
import Folder from "./components/Folder";
import "./styles.css";

type Mode = "solo" | "duo";
type Step = "home" | "quiz" | "invite" | "result";
type AnswerMap = Record<string, string>;

type Option = {
  label: string;
  value: string;
  dimension: "security" | "communication" | "companionship" | "repair" | "intimacy" | "future";
  weight: number;
};

type Question = {
  id: string;
  title: string;
  hint: string;
  options: Option[];
};

const dimensions = {
  security: "安全感",
  communication: "沟通感",
  companionship: "陪伴感",
  repair: "修复力",
  intimacy: "亲密感",
  future: "未来感",
};

const soloQuestions: Question[] = [
  {
    id: "solo_weather",
    title: "最近这段关系给你的整体感觉更像？",
    hint: "凭第一感觉选，不需要证明它一定正确。",
    options: [
      { label: "很安稳，像睡前有人留灯", value: "stable", dimension: "security", weight: 5 },
      { label: "有点忽远忽近，像消息时快时慢", value: "distant", dimension: "communication", weight: 2 },
      { label: "经常不确定，心里会反复确认", value: "uncertain", dimension: "security", weight: 1 },
      { label: "有点累，但还舍不得放下", value: "tired", dimension: "repair", weight: 2 },
      { label: "快撑不住了，想先喘口气", value: "exhausted", dimension: "repair", weight: 0 },
    ],
  },
  {
    id: "solo_seen",
    title: "最近你最希望被 TA 看见的是？",
    hint: "不是邀功，是把没说出口的部分照亮。",
    options: [
      { label: "我的付出", value: "effort", dimension: "companionship", weight: 3 },
      { label: "我的委屈", value: "hurt", dimension: "security", weight: 2 },
      { label: "我的压力", value: "pressure", dimension: "communication", weight: 3 },
      { label: "我的改变", value: "change", dimension: "future", weight: 4 },
      { label: "我其实还很在乎", value: "care", dimension: "intimacy", weight: 4 },
    ],
  },
  {
    id: "solo_stuck",
    title: "你们最近最容易卡住的地方是？",
    hint: "选一个最常重复出现的场景。",
    options: [
      { label: "说话容易误会", value: "misread", dimension: "communication", weight: 1 },
      { label: "陪伴时间不够", value: "time", dimension: "companionship", weight: 2 },
      { label: "情绪没人接住", value: "emotion", dimension: "repair", weight: 1 },
      { label: "对未来想法不同", value: "future", dimension: "future", weight: 1 },
      { label: "亲密感变少了", value: "close", dimension: "intimacy", weight: 2 },
    ],
  },
  {
    id: "solo_after_fight",
    title: "吵架或不开心之后，你通常更希望？",
    hint: "这里没有标准答案，只有你的修复节奏。",
    options: [
      { label: "立刻说清楚", value: "talk_now", dimension: "communication", weight: 4 },
      { label: "先冷静一下", value: "space", dimension: "repair", weight: 3 },
      { label: "对方主动靠近", value: "approach", dimension: "security", weight: 3 },
      { label: "有人先认真道歉", value: "apology", dimension: "repair", weight: 4 },
      { label: "表面没事，但心里会记着", value: "bury", dimension: "repair", weight: 1 },
    ],
  },
  {
    id: "solo_thought",
    title: "你最近最常冒出的念头是？",
    hint: "把那个声音放到桌面上看一眼。",
    options: [
      { label: "我们其实还可以变好", value: "better", dimension: "future", weight: 5 },
      { label: "TA 是不是没那么在乎我", value: "care_less", dimension: "security", weight: 1 },
      { label: "为什么总是我在让步", value: "give_in", dimension: "communication", weight: 1 },
      { label: "我不知道怎么开口", value: "silent", dimension: "communication", weight: 2 },
      { label: "我有点想逃开", value: "escape", dimension: "repair", weight: 0 },
    ],
  },
  {
    id: "solo_lack",
    title: "你觉得自己在关系里最缺的是？",
    hint: "选最想被补上的那一块。",
    options: [
      { label: "安全感", value: "security", dimension: "security", weight: 1 },
      { label: "被理解", value: "understood", dimension: "communication", weight: 1 },
      { label: "被偏爱", value: "chosen", dimension: "intimacy", weight: 2 },
      { label: "自由空间", value: "space", dimension: "repair", weight: 3 },
      { label: "共同规划", value: "plan", dimension: "future", weight: 2 },
    ],
  },
  {
    id: "solo_misread",
    title: "你最害怕对方误会你什么？",
    hint: "很多冲突都从被误读开始。",
    options: [
      { label: "我不在乎", value: "cold", dimension: "intimacy", weight: 2 },
      { label: "我太敏感", value: "sensitive", dimension: "security", weight: 1 },
      { label: "我太强势", value: "strong", dimension: "communication", weight: 2 },
      { label: "我太冷淡", value: "distant", dimension: "intimacy", weight: 1 },
      { label: "我要求太多", value: "needy", dimension: "security", weight: 1 },
    ],
  },
  {
    id: "solo_tonight",
    title: "如果今晚只能聊一个问题，你最想聊？",
    hint: "这会成为你的今日复盘卡。",
    options: [
      { label: "我们最近为什么变累了", value: "why_tired", dimension: "repair", weight: 2 },
      { label: "你到底需要我怎么爱你", value: "love_language", dimension: "intimacy", weight: 4 },
      { label: "我希望你理解我的哪件事", value: "understand_me", dimension: "communication", weight: 3 },
      { label: "我们还想不想一起往前走", value: "go_on", dimension: "future", weight: 2 },
      { label: "以后吵架能不能换一种方式", value: "fight_better", dimension: "repair", weight: 4 },
    ],
  },
  {
    id: "solo_need",
    title: "你希望这次测试最后给你什么？",
    hint: "结果会更偏向你此刻真正需要的东西。",
    options: [
      { label: "帮我看清关系状态", value: "clarity", dimension: "future", weight: 3 },
      { label: "给我一句能发给 TA 的话", value: "message", dimension: "communication", weight: 4 },
      { label: "告诉我该不该继续", value: "decision", dimension: "future", weight: 1 },
      { label: "帮我们找到沟通入口", value: "entry", dimension: "repair", weight: 4 },
      { label: "让我知道自己哪里可以调整", value: "self", dimension: "security", weight: 5 },
    ],
  },
];

const duoQuestions: Question[] = [
  {
    id: "duo_weather",
    title: "最近你觉得你们的关系天气更像？",
    hint: "同一片天空，两个人可能看到不同的光。",
    options: [
      { label: "晴天：稳定舒服", value: "sunny", dimension: "security", weight: 5 },
      { label: "多云：有些话没说开", value: "cloudy", dimension: "communication", weight: 3 },
      { label: "小雨：有点委屈", value: "rain", dimension: "security", weight: 2 },
      { label: "雾天：互相猜不透", value: "fog", dimension: "communication", weight: 1 },
      { label: "雷阵雨：容易爆发冲突", value: "storm", dimension: "repair", weight: 0 },
    ],
  },
  {
    id: "duo_fix",
    title: "你觉得最近你们最需要修复的是？",
    hint: "先找到入口，别急着判定结局。",
    options: [
      { label: "沟通方式", value: "talk", dimension: "communication", weight: 2 },
      { label: "陪伴时间", value: "time", dimension: "companionship", weight: 2 },
      { label: "信任感", value: "trust", dimension: "security", weight: 1 },
      { label: "情绪回应", value: "response", dimension: "repair", weight: 1 },
      { label: "未来规划", value: "plan", dimension: "future", weight: 2 },
    ],
  },
  {
    id: "duo_sad",
    title: "当你不开心时，你更希望对方？",
    hint: "这是你们最容易错位的地方之一。",
    options: [
      { label: "主动问我怎么了", value: "ask", dimension: "security", weight: 4 },
      { label: "给我一点空间", value: "space", dimension: "repair", weight: 3 },
      { label: "抱抱我或靠近我", value: "hug", dimension: "intimacy", weight: 4 },
      { label: "认真听我说完", value: "listen", dimension: "communication", weight: 5 },
      { label: "直接一起解决问题", value: "solve", dimension: "future", weight: 4 },
    ],
  },
  {
    id: "duo_effort",
    title: "你觉得自己最近为这段关系做得最多的是？",
    hint: "这题常常会翻出隐藏付出。",
    options: [
      { label: "忍耐和让步", value: "tolerate", dimension: "repair", weight: 2 },
      { label: "主动沟通", value: "communicate", dimension: "communication", weight: 5 },
      { label: "提供陪伴", value: "company", dimension: "companionship", weight: 5 },
      { label: "处理现实问题", value: "practical", dimension: "future", weight: 4 },
      { label: "调整自己的情绪", value: "adjust", dimension: "repair", weight: 4 },
    ],
  },
  {
    id: "duo_more",
    title: "你最希望对方多给你一点？",
    hint: "小一点的期待，反而更容易被实现。",
    options: [
      { label: "确定感", value: "certainty", dimension: "security", weight: 2 },
      { label: "耐心", value: "patience", dimension: "communication", weight: 3 },
      { label: "陪伴", value: "company", dimension: "companionship", weight: 2 },
      { label: "尊重", value: "respect", dimension: "repair", weight: 3 },
      { label: "亲密感", value: "close", dimension: "intimacy", weight: 2 },
    ],
  },
  {
    id: "duo_conflict",
    title: "最近一次矛盾里，你最难受的是？",
    hint: "把难受说清楚，冲突才有出口。",
    options: [
      { label: "我没有被理解", value: "unseen", dimension: "communication", weight: 1 },
      { label: "对方态度让我受伤", value: "tone", dimension: "security", weight: 1 },
      { label: "问题一直没解决", value: "unsolved", dimension: "future", weight: 1 },
      { label: "我觉得自己不被重视", value: "ignored", dimension: "intimacy", weight: 1 },
      { label: "我不知道怎么靠近", value: "distance", dimension: "repair", weight: 1 },
    ],
  },
  {
    id: "duo_state",
    title: "你觉得你们最像哪种关系状态？",
    hint: "这不是标签，是今天的快照。",
    options: [
      { label: "还相爱，但有点累", value: "love_tired", dimension: "repair", weight: 2 },
      { label: "很稳定，但少了表达", value: "stable_silent", dimension: "intimacy", weight: 3 },
      { label: "经常拉扯，但舍不得", value: "push_pull", dimension: "security", weight: 1 },
      { label: "一方追，一方躲", value: "chase_hide", dimension: "communication", weight: 1 },
      { label: "不确定还能不能继续", value: "uncertain", dimension: "future", weight: 0 },
    ],
  },
  {
    id: "duo_action",
    title: "如果对方只能改变一个小动作，你最希望是？",
    hint: "越具体，越可能真的发生。",
    options: [
      { label: "及时回复", value: "reply", dimension: "security", weight: 3 },
      { label: "好好说话", value: "tone", dimension: "communication", weight: 4 },
      { label: "主动表达爱", value: "love", dimension: "intimacy", weight: 4 },
      { label: "吵架后主动修复", value: "repair", dimension: "repair", weight: 5 },
      { label: "多参与我的生活", value: "life", dimension: "companionship", weight: 4 },
    ],
  },
  {
    id: "duo_same",
    title: "你觉得你们现在最一致的地方可能是？",
    hint: "先找共同点，关系会更容易靠近。",
    options: [
      { label: "都还在乎", value: "care", dimension: "intimacy", weight: 5 },
      { label: "都有委屈", value: "hurt", dimension: "security", weight: 2 },
      { label: "都想变好", value: "better", dimension: "future", weight: 5 },
      { label: "都怕受伤", value: "afraid", dimension: "repair", weight: 2 },
      { label: "都不知道怎么说", value: "silent", dimension: "communication", weight: 2 },
    ],
  },
  {
    id: "duo_week",
    title: "接下来一周，你愿意为关系做的一件小事是？",
    hint: "好的复盘，最后会落到一个动作。",
    options: [
      { label: "好好听对方说一次", value: "listen", dimension: "communication", weight: 5 },
      { label: "主动安排一次约会", value: "date", dimension: "companionship", weight: 5 },
      { label: "吵架时先暂停 10 分钟", value: "pause", dimension: "repair", weight: 5 },
      { label: "认真表达一次感谢", value: "thanks", dimension: "intimacy", weight: 5 },
      { label: "问对方真正需要什么", value: "ask_need", dimension: "security", weight: 5 },
    ],
  },
];

const reflectionPrompts = [
  "最近一次让你觉得被爱的细节是什么？",
  "哪句话你其实听了会安心很多？",
  "这周我们可以少争对错，多完成哪一个小动作？",
  "有什么委屈不是要责怪，只是希望被理解？",
  "如果今天只靠近 1%，我们可以怎么做？",
];

const navItems = [
  {
    label: "WARMTH",
    bgColor: "#272E3B",
    textColor: "#fff",
    links: [
      { label: "有温度阅览室", ariaLabel: "WARMTH 品牌", href: "https://flowus.cn/c712040f-ef98-44b9-b37d-dd187d92fc4d" },
      { label: "安静、克制、陪伴", ariaLabel: "WARMTH 氛围" },
    ],
  },
  {
    label: "Test",
    bgColor: "#F2EBF0",
    textColor: "#272E3B",
    links: [
      { label: "单人关系复盘", ariaLabel: "单人关系复盘" },
      { label: "双人邀请测试", ariaLabel: "双人邀请测试" },
    ],
  },
  {
    label: "Review",
    bgColor: "#EEF0F3",
    textColor: "#272E3B",
    links: [
      { label: "关系天气", ariaLabel: "关系天气" },
      { label: "今日复盘卡", ariaLabel: "今日复盘卡" },
    ],
  },
];

function encodeAnswers(answers: AnswerMap) {
  return btoa(encodeURIComponent(JSON.stringify(answers)));
}

function decodeAnswers(value: string | null): AnswerMap | null {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(atob(value))) as AnswerMap;
  } catch {
    return null;
  }
}

function optionFor(question: Question, value?: string) {
  return question.options.find((option) => option.value === value);
}

function scoreAnswers(questions: Question[], answers: AnswerMap) {
  const totals = Object.fromEntries(Object.keys(dimensions).map((key) => [key, 0])) as Record<string, number>;
  let score = 0;
  questions.forEach((question) => {
    const option = optionFor(question, answers[question.id]);
    if (option) {
      score += option.weight;
      totals[option.dimension] += option.weight;
    }
  });
  const max = questions.length * 5;
  const percent = Math.round((score / max) * 100);
  const weakest = Object.entries(totals).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "communication";
  const strongest = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "repair";
  return { percent, weakest, strongest, totals };
}

function resultMood(score: number) {
  if (score >= 78) {
    return {
      weather: "晴间微风",
      title: "并肩成长型",
      line: "你们的底色是稳定的，适合把爱从感觉变成更具体的日常动作。",
      icon: SunMedium,
    };
  }
  if (score >= 58) {
    return {
      weather: "多云转晴",
      title: "嘴硬心软型",
      line: "关系里还有很多在乎，只是表达方式有时绕了远路。",
      icon: CloudSun,
    };
  }
  if (score >= 38) {
    return {
      weather: "细雨暂停",
      title: "需要翻译器型",
      line: "你们不是没有感情，而是容易把需求说成情绪，把靠近听成压力。",
      icon: Moon,
    };
  }
  return {
    weather: "雾中靠岸",
    title: "慢速修复型",
    line: "现在更适合先降温、先说感受，再讨论解决方案。",
    icon: HeartHandshake,
  };
}

function makeMessage(weakest: string) {
  const copy: Record<string, string> = {
    security: "我不是想反复确认你爱不爱我，我只是希望在不安的时候，能多一点被选择的感觉。",
    communication: "我不是想赢过你，我只是希望我们说话的时候，都能先听见彼此真正难过的地方。",
    companionship: "我想要的不是很多安排，而是能感觉到你愿意把我放进你的生活里。",
    repair: "吵架后我也会害怕靠近，如果可以，我们下次能不能先暂停一下，再一起回来把话说完。",
    intimacy: "我有时候看起来别扭，其实是想确认我们还亲近、还在同一边。",
    future: "我不是要马上得到所有答案，只是希望知道我们还愿意一起往前想一想。",
  };
  return copy[weakest] ?? copy.communication;
}

function App() {
  const invitedAnswers = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return decodeAnswers(params.get("invite"));
  }, []);
  const [mode, setMode] = useState<Mode>(invitedAnswers ? "duo" : "solo");
  const [step, setStep] = useState<Step>(invitedAnswers ? "quiz" : "home");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [partnerAnswers] = useState<AnswerMap | null>(invitedAnswers);
  const [promptIndex, setPromptIndex] = useState(0);
  const [quizFolderOpen, setQuizFolderOpen] = useState(false);
  const questions = mode === "solo" ? soloQuestions : duoQuestions;
  const currentIndex = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];
  const progress = Math.round((currentIndex / questions.length) * 100);
  const isPartnerFlow = Boolean(partnerAnswers);

  function start(nextMode: Mode) {
    setMode(nextMode);
    setAnswers({});
    setQuizFolderOpen(false);
    setStep("quiz");
  }

  function chooseAnswer(value: string) {
    if (!currentQuestion) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: value };
    const isDone = Object.keys(nextAnswers).length === questions.length;

    setAnswers(nextAnswers);
    setQuizFolderOpen(true);
    if (isDone) {
      setStep(mode === "duo" && !partnerAnswers ? "invite" : "result");
    }
  }

  function reset() {
    window.history.replaceState({}, "", window.location.pathname);
    setStep("home");
    setAnswers({});
    setMode("solo");
    setQuizFolderOpen(false);
  }

  const soloResult = scoreAnswers(questions, answers);
  const partnerResult = partnerAnswers ? scoreAnswers(duoQuestions, partnerAnswers) : null;
  const combinedScore = partnerResult ? Math.round((soloResult.percent + partnerResult.percent) / 2) : soloResult.percent;
  const mood = resultMood(combinedScore);
  const MoodIcon = mood.icon;
  const inviteUrl =
    mode === "duo"
      ? `${window.location.origin}${window.location.pathname}?invite=${encodeAnswers(answers)}`
      : "";

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <CardNav
        logo="/brand/warmth-logo.png"
        logoAlt="WARMTH 有温度阅览室"
        brandTitle="WARMTH"
        brandSubtitle="情侣关系复盘小游戏"
        items={navItems}
        baseColor="rgba(238, 240, 243, 0.9)"
        menuColor="#272E3B"
        buttonBgColor="#A97A93"
        buttonTextColor="#fff"
        buttonLabel="回到首页"
        showButton={step !== "home"}
        onButtonClick={reset}
      />

      {step === "home" && (
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><Moon size={16} /> 5 分钟，把没说出口的话看清楚</span>
            <h1>你们最近，还好吗？</h1>
          </div>

          <div className="entry-grid">
            <BorderGlow
              className="entry-glow"
              edgeSensitivity={24}
              glowColor="330 28 58"
              backgroundColor="#F2EBF0"
              borderRadius={28}
              glowRadius={38}
              glowIntensity={0.85}
              coneSpread={24}
              animated
              colors={["#A97A93", "#E2D8DF", "#EEF0F3"]}
              fillOpacity={0.28}
            >
              <button className="entry-card solo-card" onClick={() => start("solo")}>
                <span className="entry-icon"><MessageCircleHeart /></span>
                <span className="entry-kicker">单人测试</span>
                <strong>我先自己测</strong>
                <small>适合想先理清感受，或者还没准备好邀请 TA 的时候。</small>
                <span className="entry-action">开始单人测试 <ArrowRight size={18} /></span>
              </button>
            </BorderGlow>

            <BorderGlow
              className="entry-glow"
              edgeSensitivity={24}
              glowColor="216 22 54"
              backgroundColor="#EEF0F3"
              borderRadius={28}
              glowRadius={38}
              glowIntensity={0.8}
              coneSpread={24}
              animated
              colors={["#EEF0F3", "#A97A93", "#424C5C"]}
              fillOpacity={0.24}
            >
              <button className="entry-card duo-card" onClick={() => start("duo")}>
                <span className="entry-icon"><UsersRound /></span>
                <span className="entry-kicker">双人测试</span>
                <strong>邀请 TA 一起测</strong>
                <small>双方各答一份题，看看你们在意点、委屈点和期待是否一致。</small>
                <span className="entry-action">创建双人测试 <ArrowRight size={18} /></span>
              </button>
            </BorderGlow>
          </div>

          <div className="quote-strip">
            <span>今日复盘卡</span>
            <p>{reflectionPrompts[promptIndex]}</p>
            <button onClick={() => setPromptIndex((promptIndex + 1) % reflectionPrompts.length)} aria-label="换一个问题">
              <RefreshCw size={16} />
            </button>
          </div>
        </section>
      )}

      {step === "quiz" && currentQuestion && (
        <section className="quiz-panel">
          <div className={`quiz-folder-stage ${quizFolderOpen ? "is-open" : ""}`}>
            <Folder
              key={currentQuestion.id}
              className={`quiz-folder ${quizFolderOpen ? "quiz-folder-active" : ""}`}
              color="#A97A93"
              size={1}
              open={quizFolderOpen}
              label={quizFolderOpen ? "答题中" : currentIndex === 0 ? "开始测试" : "下一题"}
              onOpenChange={setQuizFolderOpen}
              items={[
                null,
                null,
                <div className="quiz-pop-card" onClick={(event) => event.stopPropagation()}>
                  <div className="quiz-pop-head">
                    <div>
                      <span className="eyebrow">
                        {mode === "solo" ? "单人测试" : isPartnerFlow ? "TA 已答完，现在轮到你" : "双人测试：先完成你的部分"}
                      </span>
                      <h2>{currentQuestion.title}</h2>
                      <p>{currentQuestion.hint}</p>
                    </div>
                    <div className="progress-ring">
                      <span>{currentIndex + 1}</span>
                      <small>/ {questions.length}</small>
                    </div>
                  </div>

                  <div className="progress-track">
                    <span style={{ width: `${progress}%` }} />
                  </div>

                  <div className="quiz-pop-options">
                    {currentQuestion.options.map((option) => (
                      <button key={option.value} onClick={() => chooseAnswer(option.value)}>
                        <span>{option.label}</span>
                        <ArrowRight size={18} />
                      </button>
                    ))}
                  </div>
                </div>,
              ]}
            />
            {quizFolderOpen && (
              <button
                className="quiz-floating-folder"
                type="button"
                onClick={() => setQuizFolderOpen(false)}
                aria-label="返回题卡夹"
              >
                <span>答题中</span>
              </button>
            )}
          </div>
        </section>
      )}

      {step === "invite" && (
        <section className="result-layout">
          <div className="result-main invite-panel">
            <span className="eyebrow"><UsersRound size={16} /> 你的部分完成了</span>
            <h2>把这张小纸条递给 TA。</h2>
            <p>
              TA 打开链接答完同一组问题，就会生成你们的双人关系复盘。这个 demo 会把你的答案放在链接里，不需要登录。
            </p>
            <div className="invite-box">{inviteUrl}</div>
            <button
              className="primary-button"
              onClick={() => navigator.clipboard?.writeText(inviteUrl)}
            >
              <Copy size={18} /> 复制邀请链接
            </button>
            <button className="ghost-button" onClick={() => setStep("result")}>
              先看看我的单方结果
            </button>
          </div>
          <aside className="side-card">
            <span>小巧思</span>
            <p>真实上线时可以把链接做成一张可保存的邀请卡：一句话、一个二维码、一句“别急着吵，先一起看看”。</p>
          </aside>
        </section>
      )}

      {step === "result" && (
        <section className="result-layout">
          <div className="result-main">
            <div className="weather-card">
              <MoodIcon size={34} />
              <span>关系天气</span>
              <h2>{mood.weather}</h2>
              <p>{mood.line}</p>
            </div>

            <div className="reveal-grid">
              <article>
                <span>关系称号</span>
                <strong>{mood.title}</strong>
                <p>这不是判定，是你们此刻的关系快照。</p>
              </article>
              <article>
                <span>{partnerAnswers ? "你们的共同分" : "当前清晰度"}</span>
                <strong>{combinedScore}</strong>
                <p>{partnerAnswers ? "分数越高，越说明修复入口更清楚。" : "不是好坏分，而是你此刻能看见多少关系线索。"}</p>
              </article>
              <article>
                <span>最该先聊</span>
                <strong>{dimensions[soloResult.weakest as keyof typeof dimensions]}</strong>
                <p>先聊最软的需求，再聊谁该改变。</p>
              </article>
            </div>

            {partnerAnswers && (
              <div className="compare-card">
                <div>
                  <span>你的关系天气</span>
                  <strong>{resultMood(soloResult.percent).weather}</strong>
                </div>
                <div>
                  <span>TA 的关系天气</span>
                  <strong>{resultMood(partnerResult?.percent ?? 0).weather}</strong>
                </div>
                <p>
                  如果你们天气不同，先不要急着解释。可以从这句开始：
                  “我想听听，你为什么会看到那样的天气。”
                </p>
              </div>
            )}

            <div className="message-card">
              <span>可以发给 TA 的一句话</span>
              <p>“{makeMessage(soloResult.weakest)}”</p>
              <button onClick={() => navigator.clipboard?.writeText(makeMessage(soloResult.weakest))}>
                <Copy size={16} /> 复制这句话
              </button>
            </div>
          </div>

          <aside className="side-card sticky-note">
            <span>今日复盘卡</span>
            <p>{reflectionPrompts[promptIndex]}</p>
            <button onClick={() => setPromptIndex((promptIndex + 1) % reflectionPrompts.length)}>
              <RefreshCw size={16} /> 换一个
            </button>
          </aside>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
