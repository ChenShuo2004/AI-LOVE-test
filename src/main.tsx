import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Copy,
  Info,
  MessageCircleHeart,
  Moon,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import BorderGlow from "./components/BorderGlow";
import BlurText from "./components/BlurText";
import CardNav from "./components/CardNav";
import Folder from "./components/Folder";
import { buildDuoRelationshipReport, buildRelationshipReport, type DuoRelationshipReport, type Language } from "./data/relationshipReport";
import "./styles.css";

type Mode = "solo" | "duo";
type Step = "home" | "quiz" | "loading" | "invite" | "result";
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

const dimensionLabels = {
  zh: {
    security: "安全感",
    communication: "沟通感",
    companionship: "陪伴感",
    repair: "修复力",
    intimacy: "亲密感",
    future: "未来感",
  },
  en: {
    security: "Security",
    communication: "Communication",
    companionship: "Companionship",
    repair: "Repair",
    intimacy: "Intimacy",
    future: "Future",
  },
};

type DimensionKey = keyof typeof dimensionLabels.zh;
const abilityKeys = Object.keys(dimensionLabels.zh) as DimensionKey[];

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
    title: "最近你觉得你们的整体关系状态更像？",
    hint: "同一段关系，两个人可能会看见不同重点。",
    options: [
      { label: "稳定舒服，很多事不用反复确认", value: "sunny", dimension: "security", weight: 5 },
      { label: "还在乎，但有些话没说开", value: "cloudy", dimension: "communication", weight: 3 },
      { label: "有点委屈，希望被认真看见", value: "rain", dimension: "security", weight: 2 },
      { label: "互相猜不透，容易误会对方意思", value: "fog", dimension: "communication", weight: 1 },
      { label: "容易爆发冲突，需要先学会暂停", value: "storm", dimension: "repair", weight: 0 },
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

const extraSoloQuestions: Question[] = [
  {
    id: "solo_response",
    title: "当你发出一个很在意的信号后，最希望 TA 怎么回应？",
    hint: "这题看的是你对安全回应的期待。",
    options: [
      { label: "马上给我一个明确反馈", value: "clear", dimension: "security", weight: 5 },
      { label: "认真听完，不急着解释", value: "listen", dimension: "communication", weight: 4 },
      { label: "主动问我还需要什么", value: "ask", dimension: "repair", weight: 4 },
      { label: "用行动补上陪伴", value: "act", dimension: "companionship", weight: 4 },
      { label: "先别催我恢复正常", value: "space", dimension: "repair", weight: 2 },
    ],
  },
  {
    id: "solo_boundary",
    title: "你最近最想为自己保留的一点空间是？",
    hint: "健康的靠近，也需要边界。",
    options: [
      { label: "不被追问到必须马上解释", value: "no_push", dimension: "repair", weight: 3 },
      { label: "有自己的朋友和生活", value: "life", dimension: "future", weight: 4 },
      { label: "情绪低时可以先安静", value: "quiet", dimension: "repair", weight: 4 },
      { label: "不用一直证明我在乎", value: "trust", dimension: "security", weight: 3 },
      { label: "可以坦白说不舒服", value: "honest", dimension: "communication", weight: 5 },
    ],
  },
  {
    id: "solo_memory",
    title: "想到这段关系，你最舍不得的是？",
    hint: "舍不得里通常藏着关系真正有价值的部分。",
    options: [
      { label: "那些自然开心的瞬间", value: "happy", dimension: "intimacy", weight: 5 },
      { label: "TA 曾经给过我的确定", value: "certain", dimension: "security", weight: 4 },
      { label: "我们一起熬过去的事", value: "through", dimension: "repair", weight: 5 },
      { label: "共同计划过的未来", value: "plan", dimension: "future", weight: 4 },
      { label: "日常里被陪着的感觉", value: "daily", dimension: "companionship", weight: 5 },
    ],
  },
  {
    id: "solo_first_step",
    title: "如果只做一个小改变，你愿意先从哪里开始？",
    hint: "越小的动作，越容易真的发生。",
    options: [
      { label: "把情绪说成感受", value: "feeling", dimension: "communication", weight: 5 },
      { label: "少一点试探，多一点直说", value: "direct", dimension: "security", weight: 4 },
      { label: "吵完记得回来收尾", value: "repair", dimension: "repair", weight: 5 },
      { label: "主动安排一次相处", value: "date", dimension: "companionship", weight: 5 },
      { label: "一起确认一个近期计划", value: "future", dimension: "future", weight: 5 },
    ],
  },
];

const extraDuoQuestions: Question[] = [
  {
    id: "duo_signal",
    title: "你最希望对方读懂你的哪个信号？",
    hint: "不是让对方猜心，是把信号翻译得更清楚。",
    options: [
      { label: "我沉默时其实是在难过", value: "silent_sad", dimension: "communication", weight: 2 },
      { label: "我反复问是因为不安", value: "repeat", dimension: "security", weight: 2 },
      { label: "我想独处不代表不爱", value: "alone", dimension: "repair", weight: 3 },
      { label: "我分享小事是在邀请你参与", value: "share", dimension: "companionship", weight: 4 },
      { label: "我撒娇时是在确认亲近", value: "close", dimension: "intimacy", weight: 4 },
    ],
  },
  {
    id: "duo_restore",
    title: "冲突后，哪件事最能让你重新靠近？",
    hint: "修复不是翻篇，而是让心慢慢回到同一边。",
    options: [
      { label: "听到一句真诚道歉", value: "sorry", dimension: "repair", weight: 5 },
      { label: "对方解释时不推责任", value: "own", dimension: "communication", weight: 4 },
      { label: "有一个拥抱或靠近", value: "hug", dimension: "intimacy", weight: 4 },
      { label: "明确下次怎么避免", value: "avoid", dimension: "future", weight: 5 },
      { label: "先确认彼此还在乎", value: "care", dimension: "security", weight: 5 },
    ],
  },
  {
    id: "duo_daily",
    title: "你最想一起恢复的日常感是？",
    hint: "很多关系不是坏在大事，而是松在日常。",
    options: [
      { label: "睡前好好说几句话", value: "night", dimension: "companionship", weight: 5 },
      { label: "看见好玩的会分享", value: "share", dimension: "intimacy", weight: 5 },
      { label: "忙的时候也有交代", value: "busy", dimension: "security", weight: 4 },
      { label: "见面时少看手机", value: "phone", dimension: "companionship", weight: 4 },
      { label: "有矛盾当天尽量收尾", value: "same_day", dimension: "repair", weight: 5 },
    ],
  },
  {
    id: "duo_future_tiny",
    title: "关于未来，你现在最需要确认的是？",
    hint: "先确认一个小方向，不急着给所有答案。",
    options: [
      { label: "我们还愿意一起努力吗", value: "try", dimension: "future", weight: 5 },
      { label: "现实压力怎么一起分担", value: "pressure", dimension: "future", weight: 4 },
      { label: "彼此底线能不能被尊重", value: "boundary", dimension: "repair", weight: 4 },
      { label: "我们怎么安排相处时间", value: "time", dimension: "companionship", weight: 4 },
      { label: "遇到不安时怎么互相确认", value: "confirm", dimension: "security", weight: 5 },
    ],
  },
];

const questionBanks: Record<Mode, Question[]> = {
  solo: [...soloQuestions, ...extraSoloQuestions],
  duo: [...duoQuestions, ...extraDuoQuestions],
};

const QUESTIONS_PER_ROUND = 8;

const reflectionPrompts: Record<Language, string[]> = {
  zh: [
    "最近一次让你觉得被爱的细节是什么？",
    "哪句话你其实听了会安心很多？",
    "这周我们可以少争对错，多完成哪一个小动作？",
    "有什么委屈不是要责怪，只是希望被理解？",
    "如果今天只靠近 1%，我们可以怎么做？",
  ],
  en: [
    "What small detail recently made you feel loved?",
    "What sentence would help you feel safer if you heard it?",
    "What small action could you complete this week instead of debating who is right?",
    "What hurt is not a blame, but a wish to be understood?",
    "If you moved 1% closer today, what would that look like?",
  ],
};

const uiText = {
  zh: {
    logoAlt: "WARMTH 有温度阅览室",
    brandSubtitle: "情侣关系复盘小游戏",
    homeButton: "回到首页",
    menuClose: "关闭菜单",
    menuOpen: "打开菜单",
    heroEyebrow: "5 分钟，把没说出口的话看清楚",
    heroTitle: "你们最近，还好吗？",
    soloKicker: "单人测试",
    soloTitle: "我先自己测",
    soloDesc: "适合想先理清感受，或者还没准备好邀请 TA 的时候。",
    soloAction: "开始单人测试",
    duoKicker: "双人测试",
    duoTitle: "邀请 TA 一起测",
    duoDesc: "双方各答一份题，看看你们在意点、委屈点和期待是否一致。",
    duoAction: "创建双人测试",
    reviewCard: "今日复盘卡",
    changePrompt: "换一个问题",
    soloMode: "单人测试",
    partnerMode: "TA 已答完，现在轮到你",
    duoMode: "双人测试：先完成你的部分",
    progress: "题目进度",
    folderAnswering: "答题中",
    folderStart: "开始测试",
    folderNext: "下一题",
    backToCard: "返回题卡夹",
    sortingDone: "整理好了",
    sorting: "正在整理答案",
    generateInvite: "生成邀请卡",
    openReport: "打开我的报告",
    copied: "邀请链接已复制",
    copyFailed: "复制失败，请手动复制链接",
    inviteDone: "你的部分完成了",
    inviteTitle: "把这张小纸条递给 TA。",
    inviteDesc: "TA 打开链接答完同一组问题，就会生成你们的双人关系复盘。这个 demo 会把你的答案放在链接里，不需要登录。",
    copyInvite: "复制邀请链接",
    soloPreview: "先看看我的单方结果",
    tipTitle: "小巧思",
    tipDesc: "真实上线时可以把链接做成一张可保存的邀请卡：一句话、一个二维码、一句“别急着吵，先一起看看”。",
    abilityLabel: "关系能力图",
    abilityTitle: "当前关系指标",
    abilityDesc1: "六项能力来自你的答案权重。",
    abilityDesc2: "分数越高，代表这一项在当前关系里越容易被看见和使用。",
    radarLabel: "当前关系六项能力指标图",
    mainLine: "关系主线",
    relationshipRole: "你的关系角色",
    roleType: "角色类型",
    jointScore: "你们的共同分",
    clarity: "当前清晰度",
    repairEntry: "修复入口是否清晰",
    clues: "你此刻能看见多少关系线索",
    talkFirst: "最该先聊",
    talkFirstDesc: "先聊最软的需求，再聊谁该改变。",
    evidenceTitle: "为什么这样判断",
    fullReading: "一封写给你的关系来信",
    openDossier: "点击打开卷宗",
    coreNeed: "你真正需要被看见的部分",
    strength: "关系里还亮着的灯",
    misreadTitle: "最容易被误解的地方",
    realMessage: "你想表达：",
    possibleMisread: "TA 可能听成：",
    betterExpression: "更适合换成：",
    actionsTitle: "接下来 7 天可以试试",
    tonightTitle: "今晚可以从这个问题开始",
    yourNeed: "你更需要",
    partnerNeed: "TA 更需要",
    agreement: "建议约定：",
    sources: "资料依据",
    shareTitle: "可以发给 TA 的一句话",
    copySentence: "复制这句诗",
    resultNote: "结果说明",
    partnerFallback: "TA 的关系节奏",
  },
  en: {
    logoAlt: "WARMTH Reading Room",
    brandSubtitle: "Relationship Reflection Game",
    homeButton: "Home",
    menuClose: "Close menu",
    menuOpen: "Open menu",
    heroEyebrow: "5 minutes to see what has not been said",
    heroTitle: "How are you two, lately?",
    soloKicker: "Solo test",
    soloTitle: "Start with myself",
    soloDesc: "For moments when you want to sort out your own feelings first, before inviting TA in.",
    soloAction: "Start solo test",
    duoKicker: "Two-person test",
    duoTitle: "Invite TA to join",
    duoDesc: "Each of you answers the same set of questions, then compares what matters, hurts, and hopes may differ.",
    duoAction: "Create duo test",
    reviewCard: "Today's reflection card",
    changePrompt: "Change question",
    soloMode: "Solo test",
    partnerMode: "TA has finished. Now it is your turn",
    duoMode: "Duo test: finish your part first",
    progress: "Progress",
    folderAnswering: "Answering",
    folderStart: "Start",
    folderNext: "Next",
    backToCard: "Return to question folder",
    sortingDone: "Ready",
    sorting: "Organizing answers",
    generateInvite: "Generate invite card",
    openReport: "Open my report",
    copied: "Invite link copied",
    copyFailed: "Copy failed. Please copy the link manually",
    inviteDone: "Your part is complete",
    inviteTitle: "Pass this little note to TA.",
    inviteDesc: "When TA opens the link and answers the same questions, your duo reflection will be generated. This demo stores your answers in the link, with no login needed.",
    copyInvite: "Copy invite link",
    soloPreview: "Preview my solo result first",
    tipTitle: "Tiny product idea",
    tipDesc: "For launch, this link can become a saveable invite card: one sentence, one QR code, and a gentle line like “Before we argue, let's look together.”",
    abilityLabel: "Relationship ability map",
    abilityTitle: "Current relationship signals",
    abilityDesc1: "The six abilities come from your answer weights.",
    abilityDesc2: "A higher score means this ability is easier to notice and use in the current relationship.",
    radarLabel: "Six relationship ability radar chart",
    mainLine: "Relationship pattern",
    relationshipRole: "Your relationship role",
    roleType: "Role type",
    jointScore: "Shared score",
    clarity: "Current clarity",
    repairEntry: "How clear the repair entry feels",
    clues: "How many relationship clues you can see right now",
    talkFirst: "Talk about first",
    talkFirstDesc: "Start with the softest need, then discuss what could change.",
    evidenceTitle: "Why this result",
    fullReading: "A letter for this relationship",
    openDossier: "Open dossier",
    coreNeed: "What truly needs to be seen",
    strength: "What is still lit in the relationship",
    misreadTitle: "Most likely misunderstanding",
    realMessage: "What you mean: ",
    possibleMisread: "What TA may hear: ",
    betterExpression: "Try saying: ",
    actionsTitle: "Try this over the next 7 days",
    tonightTitle: "Tonight can start from this question",
    yourNeed: "You may need",
    partnerNeed: "TA may need",
    agreement: "Suggested agreement: ",
    sources: "References",
    shareTitle: "One sentence you can send to TA",
    copySentence: "Copy this sentence",
    resultNote: "Result note",
    partnerFallback: "TA's relationship rhythm",
  },
} satisfies Record<Language, Record<string, string>>;

const navItemsZh = [
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
      { label: "关系能力图", ariaLabel: "关系能力图" },
      { label: "今日复盘卡", ariaLabel: "今日复盘卡" },
    ],
  },
];

const navItemsByLang: Record<Language, typeof navItemsZh> = {
  zh: navItemsZh,
  en: [
    {
      label: "WARMTH",
      bgColor: "#272E3B",
      textColor: "#fff",
      links: [
        { label: "WARMTH Reading Room", ariaLabel: "WARMTH brand", href: "https://flowus.cn/c712040f-ef98-44b9-b37d-dd187d92fc4d" },
        { label: "Quiet, gentle, present", ariaLabel: "WARMTH feeling" },
      ],
    },
    {
      label: "Test",
      bgColor: "#F2EBF0",
      textColor: "#272E3B",
      links: [
        { label: "Solo reflection", ariaLabel: "Solo relationship reflection" },
        { label: "Duo invite test", ariaLabel: "Duo invite test" },
      ],
    },
    {
      label: "Review",
      bgColor: "#EEF0F3",
      textColor: "#272E3B",
      links: [
        { label: "Ability map", ariaLabel: "Relationship ability map" },
        { label: "Daily reflection card", ariaLabel: "Daily reflection card" },
      ],
    },
  ],
};

type QuestionTranslation = {
  title: string;
  hint: string;
  options: Record<string, string>;
};

const questionTranslationsEn: Record<string, QuestionTranslation> = {
  solo_weather: {
    title: "What does this relationship feel most like lately?",
    hint: "Choose by first feeling. You do not need to prove it is perfectly right.",
    options: {
      stable: "Very steady, like someone leaving a light on before sleep",
      distant: "A little near and far, like messages that come fast then slow",
      uncertain: "Often unsure, with my heart checking again and again",
      tired: "A little tired, but still reluctant to let go",
      exhausted: "Almost out of energy, and needing a breath first",
    },
  },
  solo_seen: {
    title: "What do you most hope TA can see in you lately?",
    hint: "This is not asking for credit. It is lighting up what has not been said.",
    options: {
      effort: "My effort",
      hurt: "My hurt",
      pressure: "My pressure",
      change: "My changes",
      care: "That I still really care",
    },
  },
  solo_stuck: {
    title: "Where do you two get stuck most often lately?",
    hint: "Choose the scene that repeats most often.",
    options: {
      misread: "Words are easily misunderstood",
      time: "There is not enough time together",
      emotion: "Emotions are not held",
      future: "Ideas about the future differ",
      close: "Closeness has become less present",
    },
  },
  solo_after_fight: {
    title: "After an argument or an unhappy moment, what do you usually hope for?",
    hint: "There is no standard answer here, only your repair rhythm.",
    options: {
      talk_now: "Talk it through right away",
      space: "Calm down first",
      approach: "The other person comes closer first",
      apology: "Someone sincerely apologizes first",
      bury: "It looks fine outside, but I remember it inside",
    },
  },
  solo_thought: {
    title: "What thought has been coming up most often lately?",
    hint: "Put that inner voice on the table for a moment.",
    options: {
      better: "We could still become better",
      care_less: "Does TA not care about me that much?",
      give_in: "Why am I always the one giving in?",
      silent: "I do not know how to start talking",
      escape: "I kind of want to escape",
    },
  },
  solo_lack: {
    title: "What do you feel you are missing most in the relationship?",
    hint: "Choose the part that most wants to be replenished.",
    options: {
      security: "Security",
      understood: "Being understood",
      chosen: "Being chosen",
      space: "Personal space",
      plan: "Shared planning",
    },
  },
  solo_misread: {
    title: "What are you most afraid TA will misunderstand about you?",
    hint: "Many conflicts begin with feeling misread.",
    options: {
      cold: "That I do not care",
      sensitive: "That I am too sensitive",
      strong: "That I am too forceful",
      distant: "That I am too cold",
      needy: "That I ask for too much",
    },
  },
  solo_tonight: {
    title: "If you could only talk about one thing tonight, what would it be?",
    hint: "This will become your reflection card for today.",
    options: {
      why_tired: "Why have we become tired lately?",
      love_language: "How do you actually need me to love you?",
      understand_me: "What do I hope you can understand about me?",
      go_on: "Do we still want to move forward together?",
      fight_better: "Can we argue in a different way next time?",
    },
  },
  solo_need: {
    title: "What do you hope this test gives you at the end?",
    hint: "The result will lean toward what you truly need right now.",
    options: {
      clarity: "Help me see the relationship more clearly",
      message: "Give me one sentence I can send to TA",
      decision: "Tell me whether I should continue",
      entry: "Help us find an entrance to talk",
      self: "Show me where I can adjust",
    },
  },
  duo_weather: {
    title: "What does your overall relationship feel most like lately?",
    hint: "In the same relationship, two people may notice different things.",
    options: {
      sunny: "Stable and comfortable, without needing constant confirmation",
      cloudy: "Still caring, but some things have not been said clearly",
      rain: "A little hurt, hoping to be seriously seen",
      fog: "Hard to read each other, easy to misunderstand intentions",
      storm: "Conflict can flare up, and you need to learn to pause first",
    },
  },
  duo_fix: {
    title: "What do you feel needs the most repair lately?",
    hint: "Find the entrance first. Do not rush to judge the ending.",
    options: {
      talk: "Communication style",
      time: "Time together",
      trust: "Trust",
      response: "Emotional response",
      plan: "Future planning",
    },
  },
  duo_sad: {
    title: "When you are unhappy, what do you hope the other person does?",
    hint: "This is one of the places where couples most easily miss each other.",
    options: {
      ask: "Ask me what happened",
      space: "Give me a little space",
      hug: "Hug me or come closer",
      listen: "Listen seriously until I finish",
      solve: "Solve the problem together directly",
    },
  },
  duo_effort: {
    title: "What have you done most for this relationship lately?",
    hint: "This question often reveals hidden effort.",
    options: {
      tolerate: "Patience and compromise",
      communicate: "Initiating communication",
      company: "Offering companionship",
      practical: "Handling practical problems",
      adjust: "Regulating my own emotions",
    },
  },
  duo_more: {
    title: "What do you most hope the other person gives you a little more of?",
    hint: "Smaller expectations are often easier to fulfill.",
    options: {
      certainty: "Certainty",
      patience: "Patience",
      company: "Companionship",
      respect: "Respect",
      close: "Closeness",
    },
  },
  duo_conflict: {
    title: "In the latest conflict, what hurt the most?",
    hint: "When hurt is named clearly, conflict has an exit.",
    options: {
      unseen: "I was not understood",
      tone: "Their attitude hurt me",
      unsolved: "The problem stayed unsolved",
      ignored: "I felt unimportant",
      distance: "I did not know how to come closer",
    },
  },
  duo_state: {
    title: "Which relationship state feels closest to you now?",
    hint: "This is not a label. It is today's snapshot.",
    options: {
      love_tired: "Still in love, but a little tired",
      stable_silent: "Stable, but with less expression",
      push_pull: "Often pulling back and forth, but reluctant to let go",
      chase_hide: "One person chases, one person hides",
      uncertain: "Unsure whether you can continue",
    },
  },
  duo_action: {
    title: "If the other person could change only one small action, what would you hope for?",
    hint: "The more specific it is, the more likely it can happen.",
    options: {
      reply: "Reply in time",
      tone: "Speak more gently",
      love: "Express love proactively",
      repair: "Repair proactively after arguments",
      life: "Participate more in my life",
    },
  },
  duo_same: {
    title: "Where might you two be most aligned right now?",
    hint: "Start with common ground. It makes closeness easier.",
    options: {
      care: "You both still care",
      hurt: "You both have hurt",
      better: "You both want things to get better",
      afraid: "You are both afraid of being hurt",
      silent: "Neither of you knows how to say it",
    },
  },
  duo_week: {
    title: "In the next week, what small thing are you willing to do for the relationship?",
    hint: "A good reflection eventually lands in one action.",
    options: {
      listen: "Listen to the other person well once",
      date: "Plan a date proactively",
      pause: "Pause for 10 minutes during an argument",
      thanks: "Express genuine appreciation once",
      ask_need: "Ask what the other person truly needs",
    },
  },
  solo_response: {
    title: "After you send an important signal, how do you most hope TA responds?",
    hint: "This looks at what kind of secure response you expect.",
    options: {
      clear: "Give me clear feedback right away",
      listen: "Listen fully without rushing to explain",
      ask: "Ask what else I need",
      act: "Use action to make up for companionship",
      space: "Do not push me to return to normal immediately",
    },
  },
  solo_boundary: {
    title: "What space do you most want to keep for yourself lately?",
    hint: "Healthy closeness also needs boundaries.",
    options: {
      no_push: "Not being pushed to explain immediately",
      life: "Having my own friends and life",
      quiet: "Being allowed to be quiet when I feel low",
      trust: "Not having to prove I care all the time",
      honest: "Being able to honestly say I feel uncomfortable",
    },
  },
  solo_memory: {
    title: "When you think about this relationship, what is hardest to let go of?",
    hint: "What is hard to let go of often holds what is truly valuable.",
    options: {
      happy: "Those naturally happy moments",
      certain: "The certainty TA once gave me",
      through: "What we got through together",
      plan: "The future we once planned",
      daily: "The feeling of being accompanied in everyday life",
    },
  },
  solo_first_step: {
    title: "If you made only one small change, where would you start?",
    hint: "The smaller the action, the easier it is to actually happen.",
    options: {
      feeling: "Say emotions as feelings",
      direct: "Less testing, more directness",
      repair: "Come back to close the conversation after an argument",
      date: "Plan time together proactively",
      future: "Confirm one near-term plan together",
    },
  },
  duo_signal: {
    title: "Which signal do you most hope the other person can understand?",
    hint: "This is not asking them to read your mind. It is translating the signal more clearly.",
    options: {
      silent_sad: "When I am silent, I am actually sad",
      repeat: "I ask repeatedly because I feel unsure",
      alone: "Wanting to be alone does not mean I do not love you",
      share: "When I share small things, I am inviting you in",
      close: "When I act cute, I am checking closeness",
    },
  },
  duo_restore: {
    title: "After conflict, what helps you come close again most?",
    hint: "Repair is not skipping over it. It is letting the heart slowly return to the same side.",
    options: {
      sorry: "Hearing a sincere apology",
      own: "The other person explains without shifting blame",
      hug: "A hug or a step closer",
      avoid: "Clearly naming how to avoid it next time",
      care: "First confirming that you still care about each other",
    },
  },
  duo_daily: {
    title: "What everyday feeling do you most want to restore together?",
    hint: "Many relationships do not break on big things, but loosen in daily life.",
    options: {
      night: "Talking properly before sleep",
      share: "Sharing funny things when you see them",
      busy: "Giving each other updates even when busy",
      phone: "Looking at phones less when meeting",
      same_day: "Trying to close conflicts on the same day",
    },
  },
  duo_future_tiny: {
    title: "About the future, what do you most need to confirm now?",
    hint: "Confirm one small direction first. No need to answer everything at once.",
    options: {
      try: "Are we still willing to try together?",
      pressure: "How can we share real-life pressure?",
      boundary: "Can our boundaries be respected?",
      time: "How should we arrange time together?",
      confirm: "How do we reassure each other when insecurity appears?",
    },
  },
};

function localizeQuestion(question: Question, lang: Language): Question {
  if (lang === "zh") return question;

  const translated = questionTranslationsEn[question.id];
  if (!translated) return question;

  return {
    ...question,
    title: translated.title,
    hint: translated.hint,
    options: question.options.map((option) => ({
      ...option,
      label: translated.options[option.value] ?? option.label,
    })),
  };
}

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

function encodeQuestionIds(ids: string[]) {
  return btoa(encodeURIComponent(JSON.stringify(ids)));
}

function decodeQuestionIds(value: string | null): string[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(value)));
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : null;
  } catch {
    return null;
  }
}

function shuffleQuestions(questions: Question[]) {
  const next = [...questions];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const random = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    const swapIndex = Math.floor(random * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function selectQuestionIds(mode: Mode) {
  return shuffleQuestions(questionBanks[mode]).slice(0, QUESTIONS_PER_ROUND).map((question) => question.id);
}

function questionsFromIds(mode: Mode, ids: string[]) {
  const bank = questionBanks[mode];
  const byId = new Map(bank.map((question) => [question.id, question]));
  const selected = ids.map((id) => byId.get(id)).filter((question): question is Question => Boolean(question));
  return selected.length ? selected : bank.slice(0, QUESTIONS_PER_ROUND);
}

function optionFor(question: Question, value?: string) {
  return question.options.find((option) => option.value === value);
}

function scoreAnswers(questions: Question[], answers: AnswerMap) {
  const totals = Object.fromEntries(abilityKeys.map((key) => [key, 0])) as Record<string, number>;
  let score = 0;
  questions.forEach((question) => {
    const option = optionFor(question, answers[question.id]);
    if (option) {
      score += option.weight;
      totals[option.dimension] += option.weight;
    }
  });
  const max = questions.length * 5;
  const percent = max ? Math.round((score / max) * 100) : 0;
  const weakest = Object.entries(totals).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "communication";
  const strongest = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "repair";
  return { percent, weakest, strongest, totals };
}

function scoreAbilities(questions: Question[], answers: AnswerMap, lang: Language) {
  const totals = Object.fromEntries(abilityKeys.map((key) => [key, 0])) as Record<DimensionKey, number>;
  const maxTotals = Object.fromEntries(abilityKeys.map((key) => [key, 0])) as Record<DimensionKey, number>;

  questions.forEach((question) => {
    abilityKeys.forEach((key) => {
      const best = Math.max(0, ...question.options.filter((option) => option.dimension === key).map((option) => option.weight));
      maxTotals[key] += best;
    });

    const option = optionFor(question, answers[question.id]);
    if (option) {
      totals[option.dimension] += option.weight;
    }
  });

  return abilityKeys.map((key) => ({
    key,
    label: dimensionLabels[lang][key],
    value: maxTotals[key] ? Math.round((totals[key] / maxTotals[key]) * 100) : 0,
  }));
}

function mergeAbilities(primary: ReturnType<typeof scoreAbilities>, partner?: ReturnType<typeof scoreAbilities> | null) {
  if (!partner) return primary;
  return primary.map((item) => {
    const matched = partner.find((partnerItem) => partnerItem.key === item.key);
    return {
      ...item,
      value: Math.round((item.value + (matched?.value ?? item.value)) / 2),
    };
  });
}

function radarPoint(index: number, value: number, total: number, radius = 92, center = 120) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const distance = radius * (value / 100);
  return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
}

function radarGridPoint(index: number, level: number, total: number, radius = 92, center = 120) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const distance = radius * level;
  return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
}

function App() {
  const inviteData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      answers: decodeAnswers(params.get("invite")),
      questionIds: decodeQuestionIds(params.get("questions")),
    };
  }, []);
  const [mode, setMode] = useState<Mode>(inviteData.answers ? "duo" : "solo");
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem("warmth-lang") === "en" ? "en" : "zh"));
  const [step, setStep] = useState<Step>(inviteData.answers ? "quiz" : "home");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [partnerAnswers] = useState<AnswerMap | null>(inviteData.answers);
  const [questionIds, setQuestionIds] = useState<string[]>(
    inviteData.questionIds ?? (inviteData.answers ? Object.keys(inviteData.answers) : selectQuestionIds("solo")),
  );
  const [promptIndex, setPromptIndex] = useState(0);
  const [quizFolderOpen, setQuizFolderOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [reportReady, setReportReady] = useState(false);
  const [showResultNote, setShowResultNote] = useState(false);
  const text = uiText[lang];
  const prompts = reflectionPrompts[lang];
  const questions = useMemo(() => questionsFromIds(mode, questionIds).map((question) => localizeQuestion(question, lang)), [mode, questionIds, lang]);
  const currentIndex = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];
  const progress = Math.round((currentIndex / questions.length) * 100);
  const isPartnerFlow = Boolean(partnerAnswers);

  useEffect(() => {
    window.history.replaceState({ step, mode, quizFolderOpen }, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as { step?: Step; mode?: Mode; quizFolderOpen?: boolean } | null;
      if (!state?.step) return;

      setStep(state.step);
      if (state.mode) setMode(state.mode);
      setQuizFolderOpen(Boolean(state.quizFolderOpen));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    localStorage.setItem("warmth-lang", lang);
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }, [lang]);

  function goToStep(nextStep: Step, nextMode = mode, nextFolderOpen = nextStep === "quiz") {
    setStep(nextStep);
    setMode(nextMode);
    setQuizFolderOpen(nextFolderOpen);
    if (nextStep !== "result") setShowResultNote(false);
    window.history.pushState({ step: nextStep, mode: nextMode, quizFolderOpen: nextFolderOpen }, "", window.location.href);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function start(nextMode: Mode) {
    setAnswers({});
    setQuestionIds(selectQuestionIds(nextMode));
    goToStep("quiz", nextMode, false);
  }

  function chooseAnswer(value: string) {
    if (!currentQuestion) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: value };
    const isDone = Object.keys(nextAnswers).length === questions.length;

    setAnswers(nextAnswers);
    setQuizFolderOpen(true);
    if (isDone) {
      setReportReady(false);
      goToStep("loading");
    }
  }

  function reset() {
    window.history.replaceState({}, "", window.location.pathname);
    setStep("home");
    setAnswers({});
    setMode("solo");
    setQuestionIds(selectQuestionIds("solo"));
    setQuizFolderOpen(false);
    setReportReady(false);
    setShowResultNote(false);
  }

  function openReport() {
    goToStep(mode === "duo" && !partnerAnswers ? "invite" : "result");
  }

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => setToastMessage(""), 2000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (step !== "loading") return;

    setReportReady(false);
    const timer = window.setTimeout(() => setReportReady(true), 2200);
    return () => window.clearTimeout(timer);
  }, [step]);

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setToastMessage(text.copied);
    } catch {
      setToastMessage(text.copyFailed);
    }
  }

  const soloResult = scoreAnswers(questions, answers);
  const partnerResult = partnerAnswers ? scoreAnswers(questions, partnerAnswers) : null;
  const abilityScores = mergeAbilities(
    scoreAbilities(questions, answers, lang),
    partnerAnswers ? scoreAbilities(questions, partnerAnswers, lang) : null,
  );
  const radarPoints = abilityScores.map((item, index) => radarPoint(index, item.value, abilityScores.length)).join(" ");
  const report = partnerAnswers && partnerResult
    ? buildDuoRelationshipReport({
        questions,
        answers,
        partnerAnswers,
        score: soloResult,
        partnerScore: partnerResult,
        lang,
      })
    : buildRelationshipReport({
        questions,
        answers,
        score: soloResult,
        hasPartner: false,
        lang,
      });
  const duoReport: DuoRelationshipReport | null = partnerAnswers && partnerResult ? report as DuoRelationshipReport : null;
  const inviteUrl =
    mode === "duo"
      ? `${window.location.origin}${window.location.pathname}?invite=${encodeAnswers(answers)}&questions=${encodeQuestionIds(questions.map((question) => question.id))}`
      : "";
  const appNavItems = [
    navItemsByLang[lang][0],
    {
      ...navItemsByLang[lang][1],
      links: [
        { ...navItemsByLang[lang][1].links[0], onClick: () => start("solo") },
        { ...navItemsByLang[lang][1].links[1], onClick: () => start("duo") },
      ],
    },
    {
      ...navItemsByLang[lang][2],
      links: [
        { ...navItemsByLang[lang][2].links[0], onClick: () => (Object.keys(answers).length ? goToStep("result") : start("solo")) },
        { ...navItemsByLang[lang][2].links[1], onClick: () => setPromptIndex((promptIndex + 1) % prompts.length) },
      ],
    },
  ];

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      {toastMessage && (
        <div className="toast-notice" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}

      <CardNav
        logo="/brand/warmth-logo.png"
        logoAlt={text.logoAlt}
        brandTitle="WARMTH"
        brandSubtitle={text.brandSubtitle}
        items={appNavItems}
        baseColor="rgba(238, 240, 243, 0.9)"
        menuColor="#272E3B"
        buttonBgColor="#A97A93"
        buttonTextColor="#fff"
        buttonLabel={text.homeButton}
        menuOpenLabel={text.menuOpen}
        menuCloseLabel={text.menuClose}
        showButton={step !== "home"}
        onButtonClick={reset}
        rightSlot={(
          <button
            className="language-toggle"
            type="button"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            aria-label={lang === "zh" ? "Switch to English" : "切换到中文"}
          >
            <span className={lang === "zh" ? "is-active" : ""}>中文</span>
            <span className={lang === "en" ? "is-active" : ""}>EN</span>
          </button>
        )}
      />

      {step === "home" && (
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><Moon size={16} /> {text.heroEyebrow}</span>
            <BlurText
              text={text.heroTitle}
              animateBy="letters"
              direction="top"
              delay={80}
              stepDuration={0.38}
              className="hero-title"
            />
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
                <span className="entry-kicker">{text.soloKicker}</span>
                <strong>{text.soloTitle}</strong>
                <small>{text.soloDesc}</small>
                <span className="entry-action">{text.soloAction} <ArrowRight size={18} /></span>
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
                <span className="entry-kicker">{text.duoKicker}</span>
                <strong>{text.duoTitle}</strong>
                <small>{text.duoDesc}</small>
                <span className="entry-action">{text.duoAction} <ArrowRight size={18} /></span>
              </button>
            </BorderGlow>
          </div>

          <div className="quote-strip">
            <span>{text.reviewCard}</span>
            <p>{prompts[promptIndex]}</p>
            <button onClick={() => setPromptIndex((promptIndex + 1) % prompts.length)} aria-label={text.changePrompt}>
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
              coverImage="/covers/quiz-folder-cover.jpg"
              size={1}
              open={quizFolderOpen}
              label={quizFolderOpen ? text.folderAnswering : currentIndex === 0 ? text.folderStart : text.folderNext}
              onOpenChange={setQuizFolderOpen}
              items={[
                null,
                null,
                <div className="quiz-pop-card" onClick={(event) => event.stopPropagation()}>
                  <div className="quiz-pop-head">
                    <div>
                      <span className="eyebrow">
                        {mode === "solo" ? text.soloMode : isPartnerFlow ? text.partnerMode : text.duoMode}
                      </span>
                      <h2>{currentQuestion.title}</h2>
                      <p>{currentQuestion.hint}</p>
                    </div>
                    <div className="progress-ring">
                      <span>{currentIndex + 1} / {questions.length}</span>
                      <small>{text.progress}</small>
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
                aria-label={text.backToCard}
              >
                <span>{text.folderAnswering}</span>
              </button>
            )}
          </div>
        </section>
      )}

      {step === "loading" && (
        <section className="loading-panel" aria-live="polite">
          <div className="envelope-card">
            <div className="envelope-stage" aria-hidden="true">
              <div className="envelope-shadow" />
              <div className="letter-paper">
                <span />
                <span />
                <span />
              </div>
              <div className="envelope-body">
                <div className="envelope-back" />
                <div className="envelope-left" />
                <div className="envelope-right" />
                <div className="envelope-front" />
                <div className="envelope-flap" />
              </div>
            </div>
            <div className={`envelope-status ${reportReady ? "is-ready" : ""}`}>
              <span>{reportReady ? text.sortingDone : text.sorting}</span>
              {!reportReady && (
                <>
                  <i />
                  <i />
                  <i />
                </>
              )}
            </div>
            {reportReady && (
              <button className="primary-button envelope-open-button" type="button" onClick={openReport}>
                {mode === "duo" && !partnerAnswers ? text.generateInvite : text.openReport} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </section>
      )}

      {step === "invite" && (
        <section className="result-layout">
          <div className="result-main invite-panel">
            <span className="eyebrow"><UsersRound size={16} /> {text.inviteDone}</span>
            <h2>{text.inviteTitle}</h2>
            <p>
              {text.inviteDesc}
            </p>
            <div className="invite-box">{inviteUrl}</div>
            <button
              className="primary-button"
              onClick={copyInviteLink}
            >
              <Copy size={18} /> {text.copyInvite}
            </button>
            <button className="ghost-button" onClick={() => goToStep("result")}>
              {text.soloPreview}
            </button>
          </div>
          <aside className="side-card">
            <span>{text.tipTitle}</span>
            <p>{text.tipDesc}</p>
          </aside>
        </section>
      )}

      {step === "result" && (
        <section className="result-layout result-layout-single">
          <div className="result-main">
            <div className="role-card">
              <div className="role-metrics">
                <span>{text.abilityLabel}</span>
                <div className="radar-wrap" aria-label={text.radarLabel}>
                  <svg viewBox="0 0 240 240" role="img">
                    {[0.33, 0.66, 1].map((level) => (
                      <polygon
                        key={level}
                        className="radar-grid-line"
                        points={abilityScores.map((_, index) => radarGridPoint(index, level, abilityScores.length)).join(" ")}
                      />
                    ))}
                    {abilityScores.map((_, index) => (
                      <line
                        key={index}
                        className="radar-axis"
                        x1="120"
                        y1="120"
                        x2={radarGridPoint(index, 1, abilityScores.length).split(",")[0]}
                        y2={radarGridPoint(index, 1, abilityScores.length).split(",")[1]}
                      />
                    ))}
                    <polygon className="radar-shape" points={radarPoints} />
                    {abilityScores.map((item, index) => {
                      const [x, y] = radarPoint(index, item.value, abilityScores.length).split(",");
                      return <circle key={item.key} className="radar-dot" cx={x} cy={y} r="4.5" />;
                    })}
                  </svg>
                </div>
                <div className="ability-list">
                  {abilityScores.map((item) => (
                    <div key={item.key}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <i style={{ width: `${item.value}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="role-avatar"
                role="img"
                aria-label={report.roleImageAlt}
                style={{ backgroundPosition: report.roleImagePosition }}
              />
              <div className="role-copy">
                <span>{text.relationshipRole}</span>
                <strong>{report.roleTitle}</strong>
                <p><b>{text.roleType}</b>{report.roleName} · {report.patternTitle}</p>
              </div>
            </div>

            <div className={`credibility-card ${showResultNote ? "is-open" : ""}`}>
              <button
                className="credibility-toggle"
                type="button"
                onClick={() => setShowResultNote((current) => !current)}
                aria-label={text.resultNote}
                aria-expanded={showResultNote}
              >
                <Info size={18} aria-hidden="true" />
              </button>
              {showResultNote && (
                <div className="credibility-popover" role="note">
                  <span>{text.resultNote}</span>
                  <p>{report.credibilityNote}</p>
                </div>
              )}
            </div>

            <details className="letter-dossier">
              <summary>
                <span>{text.fullReading}</span>
                <strong>{text.openDossier}</strong>
              </summary>
              <div className="full-reading-card">
                <span>{text.fullReading}</span>
                <strong>{report.longFormHighlight}</strong>
                <div className="letter-body">
                  {report.longFormInsight.split("\n\n").map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </details>

            <details className="evidence-card">
              <summary>
                <span>{text.evidenceTitle}</span>
                <small>{lang === "en" ? "Click to view answer evidence" : "点击展开回答依据"}</small>
              </summary>
              <div>
                {report.evidence.map((item) => (
                  <p key={`${item.questionTitle}-${item.answerLabel}`}>{item.evidence}</p>
                ))}
              </div>
            </details>

            {partnerAnswers && (
              <div className="compare-card">
                <div>
                  <span>{text.yourNeed}</span>
                  <strong>{duoReport?.userNeed ?? dimensionLabels[lang][soloResult.weakest as DimensionKey]}</strong>
                </div>
                <div>
                  <span>{text.partnerNeed}</span>
                  <strong>{duoReport?.partnerNeed ?? (partnerResult ? dimensionLabels[lang][partnerResult.weakest as DimensionKey] : text.partnerFallback)}</strong>
                </div>
                <p>
                  {duoReport?.conflictCycle ?? (lang === "en" ? "If you notice different things, do not rush to explain. Listen first to why each person chose this." : "如果你们看到的重点不同，先不要急着解释，可以先听听彼此为什么会这样选择。")}
                </p>
                <p>
                  <strong>{text.agreement}</strong>{duoReport?.agreement ?? (lang === "en" ? "Listen first, then discuss the next step." : "先听完，再讨论下一步。")}
                </p>
              </div>
            )}

            <details className="source-card">
              <summary>
                <span>{text.sources}</span>
                <small>{lang === "en" ? "Click to view references" : "点击展开引用资料"}</small>
              </summary>
              <div>
                {report.sources.map((source) => (
                  <a key={source.key} href={source.url} target="_blank" rel="noreferrer">
                    <strong>{source.title}</strong>
                    <small>{source.source}</small>
                    <p>{source.note}</p>
                  </a>
                ))}
              </div>
            </details>
          </div>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
