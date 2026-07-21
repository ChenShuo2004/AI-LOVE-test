export type RelationshipDimension =
  | "security"
  | "communication"
  | "companionship"
  | "repair"
  | "intimacy"
  | "future";

export type AnswerMap = Record<string, string>;
export type Language = "zh" | "en";

export type OptionLike = {
  label: string;
  value: string;
  dimension: RelationshipDimension;
  weight: number;
};

export type QuestionLike = {
  id: string;
  title: string;
  options: OptionLike[];
};

export type ScoreLike = {
  percent: number;
  weakest: string;
  strongest: string;
};

export type SourceKey =
  | "gottman_turning_toward"
  | "gottman_conflict"
  | "eft_responsiveness"
  | "partner_responsiveness"
  | "nvc";

export type SourceCard = {
  key: SourceKey;
  title: string;
  source: string;
  url: string;
  note: string;
};

export type AnswerEvidence = {
  questionTitle: string;
  answerLabel: string;
  dimension: RelationshipDimension;
  weight: number;
  tags: string[];
  evidence: string;
  sourceKeys: SourceKey[];
};

export type RelationshipReport = {
  roleTitle: string;
  roleName: string;
  roleSymbol: string;
  patternTitle: string;
  oneLineSummary: string;
  longFormInsight: string;
  longFormHighlight: string;
  coreNeed: string;
  realMessage: string;
  possibleMisread: string;
  betterExpression: string;
  strength: string;
  actions: string[];
  shareableMessage: string;
  evidence: AnswerEvidence[];
  sources: SourceCard[];
  credibilityNote: string;
};

export type DuoRelationshipReport = RelationshipReport & {
  sharedNeed: string;
  userNeed: string;
  partnerNeed: string;
  conflictCycle: string;
  agreement: string;
};

type PatternTemplate = {
  key: string;
  triggerTags: string[];
  triggerDimensions: RelationshipDimension[];
  roleTitle: string;
  roleName: string;
  roleSymbol: string;
  title: string;
  oneLineSummary: string;
  coreNeed: string;
  realMessage: string;
  possibleMisread: string;
  betterExpression: string;
  strength: string;
  actions: string[];
  shareableMessage: string;
  sourceKeys: SourceKey[];
};

const dimensionLabels: Record<RelationshipDimension, string> = {
  security: "安全感",
  communication: "沟通感",
  companionship: "陪伴感",
  repair: "修复力",
  intimacy: "亲密感",
  future: "未来感",
};

const dimensionLabelsEn: Record<RelationshipDimension, string> = {
  security: "Security",
  communication: "Communication",
  companionship: "Companionship",
  repair: "Repair",
  intimacy: "Intimacy",
  future: "Future",
};

export const sourceCards: Record<SourceKey, SourceCard> = {
  gottman_turning_toward: {
    key: "gottman_turning_toward",
    title: "连接请求需要被看见",
    source: "The Gottman Institute",
    url: "https://www.gottman.com/blog/turn-toward-instead-of-away/",
    note: "Gottman 的关系研究强调，伴侣对日常连接请求的回应，会影响关系里的亲近感和情绪账户。",
  },
  gottman_conflict: {
    key: "gottman_conflict",
    title: "冲突更适合被管理",
    source: "The Gottman Institute",
    url: "https://www.gottman.com/blog/managing-vs-resolving-conflict-relationships/",
    note: "很多长期分歧不一定能被彻底消除，但可以通过更温和、可重复的方式被管理。",
  },
  eft_responsiveness: {
    key: "eft_responsiveness",
    title: "负向互动循环可以被重组",
    source: "ICEEFT",
    url: "https://iceeft.com/eft-research/",
    note: "情绪取向伴侣治疗关注依恋需求、情绪回应和伴侣之间反复出现的负向互动循环。",
  },
  partner_responsiveness: {
    key: "partner_responsiveness",
    title: "被回应会影响亲密感",
    source: "NIH / PMC",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5922804/",
    note: "伴侣回应性研究把被理解、被关心、被确认视为影响亲密和关系满意度的重要过程。",
  },
  nvc: {
    key: "nvc",
    title: "把指责换成请求",
    source: "Center for Nonviolent Communication",
    url: "https://www.cnvc.org/about/purpose-of-nvc/",
    note: "非暴力沟通强调观察、感受、需要和请求，能帮助对话从责备转向可执行的表达。",
  },
};

const sourceCardsEn: Record<SourceKey, SourceCard> = {
  gottman_turning_toward: {
    ...sourceCards.gottman_turning_toward,
    title: "Bids for connection need to be noticed",
    note: "Gottman relationship research emphasizes that how partners respond to daily bids for connection shapes closeness and the emotional bank account.",
  },
  gottman_conflict: {
    ...sourceCards.gottman_conflict,
    title: "Conflict is often better managed than solved",
    note: "Many long-term differences are not erased completely, but they can be managed through warmer, repeatable ways of talking.",
  },
  eft_responsiveness: {
    ...sourceCards.eft_responsiveness,
    title: "Negative interaction cycles can be reshaped",
    note: "Emotionally Focused Therapy focuses on attachment needs, emotional responsiveness, and recurring negative cycles between partners.",
  },
  partner_responsiveness: {
    ...sourceCards.partner_responsiveness,
    title: "Feeling responded to affects intimacy",
    note: "Partner responsiveness research treats feeling understood, cared for, and validated as an important process in intimacy and relationship satisfaction.",
  },
  nvc: {
    ...sourceCards.nvc,
    title: "Turn blame into requests",
    note: "Nonviolent Communication emphasizes observations, feelings, needs, and requests, helping conversations move from blame to actionable expression.",
  },
};

const tagLibrary: Record<string, { label: string; sourceKeys: SourceKey[] }> = {
  needs_reassurance: { label: "需要确认", sourceKeys: ["partner_responsiveness", "eft_responsiveness"] },
  communication_gap: { label: "沟通错位", sourceKeys: ["nvc", "gottman_conflict"] },
  daily_disconnection: { label: "日常失联", sourceKeys: ["gottman_turning_toward", "partner_responsiveness"] },
  repair_needed: { label: "需要修复", sourceKeys: ["gottman_conflict", "eft_responsiveness"] },
  intimacy_distance: { label: "亲密变远", sourceKeys: ["gottman_turning_toward", "partner_responsiveness"] },
  future_alignment: { label: "方向确认", sourceKeys: ["gottman_conflict", "nvc"] },
  boundary_sensitive: { label: "边界敏感", sourceKeys: ["nvc", "eft_responsiveness"] },
  emotion_accumulated: { label: "情绪积压", sourceKeys: ["eft_responsiveness", "nvc"] },
};

const tagLabelsEn: Record<string, string> = {
  needs_reassurance: "a need for reassurance",
  communication_gap: "a communication mismatch",
  daily_disconnection: "daily disconnection",
  repair_needed: "a need for repair",
  intimacy_distance: "emotional distance",
  future_alignment: "future alignment",
  boundary_sensitive: "sensitivity around boundaries",
  emotion_accumulated: "accumulated emotion",
};

const patternTemplates: PatternTemplate[] = [
  {
    key: "high_care_low_expression",
    triggerTags: ["communication_gap", "intimacy_distance"],
    triggerDimensions: ["communication", "intimacy"],
    roleTitle: "想把话说明白的人",
    roleName: "老师型",
    roleSymbol: "✦",
    title: "高在乎低表达型",
    oneLineSummary: "你不是不在乎，而是很多在乎没有被稳定、清楚地说出来。",
    coreNeed: "你需要的不是赢过对方，而是让彼此真正听见“我为什么难过”。",
    realMessage: "我其实还在乎，只是不知道怎么说才不会又吵起来。",
    possibleMisread: "TA 可能会把你的沉默或别扭听成冷淡。",
    betterExpression: "我不是不想靠近，只是有些话我怕一开口就变成争吵。",
    strength: "你们还有在乎作为底色，只要表达方式变柔和，关系就有重新靠近的空间。",
    actions: ["把“你总是”换成“我感受到”", "一次只聊一个具体场景", "先复述对方感受，再表达自己的需要"],
    shareableMessage: "我不是不想说，我只是希望我们说的时候，都能先听见彼此真正难过的地方。",
    sourceKeys: ["nvc", "partner_responsiveness"],
  },
  {
    key: "needs_reassurance",
    triggerTags: ["needs_reassurance"],
    triggerDimensions: ["security"],
    roleTitle: "等一句确定的人",
    roleName: "守灯人型",
    roleSymbol: "◇",
    title: "需要确认型",
    oneLineSummary: "你最需要被接住的是确定感：不是反复证明，而是关键时刻被清楚选择。",
    coreNeed: "你需要稳定回应、明确态度和一种“我们还在同一边”的感觉。",
    realMessage: "我不是想逼你证明爱我，我只是需要知道你还愿意回应我。",
    possibleMisread: "TA 可能会把你的确认需求听成压力、质问或不信任。",
    betterExpression: "当我不安的时候，如果你能明确回应一句，我会更容易放松下来。",
    strength: "你能说出不安，本身就是关系还有沟通入口的信号。",
    actions: ["约定一个固定回应信号", "少用试探，多说具体需要", "把确认需求说成请求，而不是反问"],
    shareableMessage: "我不是想反复确认你爱不爱我，我只是希望不安的时候，能多一点被选择的感觉。",
    sourceKeys: ["partner_responsiveness", "eft_responsiveness"],
  },
  {
    key: "slow_repair",
    triggerTags: ["repair_needed"],
    triggerDimensions: ["repair"],
    roleTitle: "希望吵完还能回来的人",
    roleName: "医护者型",
    roleSymbol: "＋",
    title: "慢速修复型",
    oneLineSummary: "你们不是没有感情，而是冲突之后缺少一套不伤人的回来方式。",
    coreNeed: "你真正需要的是吵完之后还能收尾，而不是把每次争执都变成关系结论。",
    realMessage: "我也想回来好好说，只是不想在情绪最高的时候继续互相伤害。",
    possibleMisread: "TA 可能把你的暂停理解成冷处理，或把你的追问理解成逼迫。",
    betterExpression: "我们先暂停一下，但我不是不管了，我想晚一点回来把话说完。",
    strength: "只要你们愿意约定“暂停后回来”，冲突就不会轻易变成断联。",
    actions: ["情绪高时暂停 10 分钟", "暂停前说清楚几点回来聊", "先修复态度，再讨论事情"],
    shareableMessage: "如果我们又吵起来，可以先暂停，但不要消失，我们约好回来把话说完。",
    sourceKeys: ["gottman_conflict", "eft_responsiveness"],
  },
  {
    key: "emotion_accumulated",
    triggerTags: ["emotion_accumulated"],
    triggerDimensions: ["repair", "security"],
    roleTitle: "还有委屈没被听见的人",
    roleName: "学者型",
    roleSymbol: "※",
    title: "情绪积压型",
    oneLineSummary: "你现在的难受不是突然出现的，而是很多小失望没有被及时看见。",
    coreNeed: "你需要的是把委屈放到桌面上，而不是继续靠忍耐维持表面和平。",
    realMessage: "我不是想翻旧账，我只是发现有些难受一直没有被好好听见。",
    possibleMisread: "TA 可能会觉得你在算账，没听见你其实是在求理解。",
    betterExpression: "我想说的是这件事对我的影响，不是要把你判成错的人。",
    strength: "你还能整理这些情绪，说明你不是只想爆发，而是想找一个出口。",
    actions: ["一次只说一件具体委屈", "先讲影响，不急着追责", "把旧账整理成一个可讨论的请求"],
    shareableMessage: "我不是想翻旧账，我只是想让那些一直没被听见的难受，终于有一个出口。",
    sourceKeys: ["nvc", "eft_responsiveness"],
  },
  {
    key: "daily_disconnection",
    triggerTags: ["daily_disconnection"],
    triggerDimensions: ["companionship"],
    roleTitle: "想被放进日常的人",
    roleName: "旅人型",
    roleSymbol: "⌁",
    title: "日常失联型",
    oneLineSummary: "你在意的不是陪伴时长本身，而是有没有被放进对方的生活节奏里。",
    coreNeed: "你需要被惦记、被分享、被自然地纳入日常。",
    realMessage: "我想要的不是很多安排，而是能感觉到你愿意让我参与你的生活。",
    possibleMisread: "TA 可能会以为你只是嫌陪伴不够，没听见你在要参与感。",
    betterExpression: "我希望我们不只是有空才见面，也能在日常里多一点彼此的位置。",
    strength: "日常是最容易修复的部分，因为它不靠大承诺，只靠小动作重复出现。",
    actions: ["每天留一个真实近况", "本周安排一次不赶时间的相处", "看到小事时主动分享给对方"],
    shareableMessage: "我想要的不是很多安排，而是能感觉到你愿意把我放进你的生活里。",
    sourceKeys: ["gottman_turning_toward", "partner_responsiveness"],
  },
  {
    key: "push_pull_close",
    triggerTags: ["needs_reassurance", "boundary_sensitive"],
    triggerDimensions: ["security", "repair"],
    roleTitle: "想靠近又怕受伤的人",
    roleName: "守护者型",
    roleSymbol: "◌",
    title: "拉扯靠近型",
    oneLineSummary: "你们可能一个更想马上确认，一个更需要先缓一缓，于是靠近变成拉扯。",
    coreNeed: "你需要既有确认，也有节奏；既不被丢下，也不被逼到防御。",
    realMessage: "我想靠近你，但我也怕我们用错方式又互相伤害。",
    possibleMisread: "TA 可能只看到你的追或躲，却没看见背后的不安。",
    betterExpression: "我想靠近，但我们能不能用一个没那么紧绷的方式来聊？",
    strength: "拉扯说明关系里还有牵引力，关键是给靠近设一个更安全的节奏。",
    actions: ["先确认关系，再讨论问题", "给冷静设定明确时间", "用“我需要一点节奏”替代突然消失"],
    shareableMessage: "我想靠近你，但希望我们能用一种不那么紧绷的方式靠近。",
    sourceKeys: ["eft_responsiveness", "gottman_conflict"],
  },
  {
    key: "boundary_sensitive",
    triggerTags: ["boundary_sensitive"],
    triggerDimensions: ["repair", "future"],
    roleTitle: "需要空间也需要被懂的人",
    roleName: "边界守门人型",
    roleSymbol: "□",
    title: "边界敏感型",
    oneLineSummary: "你并不是想推开关系，而是希望靠近的时候也能保留自己的空间。",
    coreNeed: "你需要被尊重、被允许慢一点，也需要关系里的边界不被误读成不爱。",
    realMessage: "我需要一点空间，但这不代表我不在乎。",
    possibleMisread: "TA 可能会把你的独处、沉默或慢回应理解成疏远。",
    betterExpression: "我想先安静一下，不是要离开你，我会在状态好一点后回来聊。",
    strength: "能把边界说清楚，会让关系更稳定，而不是更远。",
    actions: ["提前说明独处不是冷处理", "把边界说成时间和动作", "同时给对方一个确定的回来信号"],
    shareableMessage: "我需要一点空间，但不是想离开你；我只是想用更好的状态回来靠近你。",
    sourceKeys: ["nvc", "eft_responsiveness"],
  },
  {
    key: "aligned_growth",
    triggerTags: ["future_alignment"],
    triggerDimensions: ["future"],
    roleTitle: "想知道是否还同路的人",
    roleName: "导师型",
    roleSymbol: "⌖",
    title: "并肩调整型",
    oneLineSummary: "你们的重点不是立刻给关系定性，而是确认还愿不愿意一起往前调整。",
    coreNeed: "你需要方向感、共同计划和一种“我们愿意一起解决”的确定。",
    realMessage: "我不需要马上得到所有答案，但我想知道我们是不是还愿意一起想办法。",
    possibleMisread: "TA 可能把你谈未来听成压力，而不是听见你在寻找方向。",
    betterExpression: "我不是要你马上承诺所有事情，我只是想和你一起确认下一小步。",
    strength: "只要还能一起讨论下一步，关系就不只停留在情绪里。",
    actions: ["先定一个一周内的小目标", "把担心拆成现实问题", "每周复盘一次钱、时间和计划"],
    shareableMessage: "我不是要马上得到所有答案，只是希望知道我们还愿意一起往前想一想。",
    sourceKeys: ["gottman_conflict", "nvc"],
  },
];

const patternTemplateEn: Record<string, Omit<PatternTemplate, "key" | "triggerTags" | "triggerDimensions" | "sourceKeys" | "roleSymbol">> = {
  high_care_low_expression: {
    roleTitle: "The one trying to make things clear",
    roleName: "Teacher Type",
    title: "High Care, Low Expression",
    oneLineSummary: "It is not that you do not care. A lot of care simply has not been expressed in a steady, clear way.",
    coreNeed: "What you need is not to win the conversation, but to help each other hear why this has been hard.",
    realMessage: "I still care. I just do not know how to say it without turning it into another argument.",
    possibleMisread: "TA may hear your silence or defensiveness as distance.",
    betterExpression: "I am not trying to pull away. I am afraid that once I start talking, we will hurt each other again.",
    strength: "There is still care underneath this. If the way you speak becomes softer and clearer, the relationship has room to come closer again.",
    actions: ["Replace \"you always\" with \"I feel\"", "Talk about one specific moment at a time", "Reflect the other person's feeling before stating your need"],
    shareableMessage: "I am not avoiding the conversation. I just hope that when we talk, we can first hear where each of us is hurting.",
  },
  needs_reassurance: {
    roleTitle: "The one waiting for a clear yes",
    roleName: "Light Keeper Type",
    title: "Reassurance-Seeking",
    oneLineSummary: "The thing that most needs care is reassurance: not repeated proof, but being clearly chosen in key moments.",
    coreNeed: "You need steady responses, clear signals, and the feeling that you are still on the same side.",
    realMessage: "I am not trying to force you to prove your love. I need to know you are still willing to respond to me.",
    possibleMisread: "TA may hear your need for reassurance as pressure, questioning, or distrust.",
    betterExpression: "When I feel unsure, one clear response from you would help me relax much more easily.",
    strength: "Being able to name insecurity is already a sign that there is still an opening for communication.",
    actions: ["Agree on a small reassurance signal", "Use fewer tests and more specific requests", "Turn reassurance needs into requests instead of questions"],
    shareableMessage: "I am not asking you to prove your love again and again. When I feel unsure, I just hope to feel chosen a little more clearly.",
  },
  slow_repair: {
    roleTitle: "The one hoping conflict can still come back",
    roleName: "Caregiver Type",
    title: "Slow Repair",
    oneLineSummary: "This is not a lack of feeling. It is a lack of a safe way back after conflict.",
    coreNeed: "You need arguments to have an ending, instead of turning every disagreement into a verdict on the relationship.",
    realMessage: "I also want to come back and talk. I just do not want us to keep hurting each other at the emotional peak.",
    possibleMisread: "TA may read your pause as coldness, or your follow-up as pressure.",
    betterExpression: "Let us pause for a bit. I am not disappearing. I want to come back later and finish this gently.",
    strength: "If you can agree to come back after a pause, conflict does not have to become disconnection.",
    actions: ["Pause for 10 minutes when emotions are high", "Name when you will come back before pausing", "Repair the tone before debating the issue"],
    shareableMessage: "If we argue again, can we pause without disappearing, and agree to come back to finish the conversation?",
  },
  emotion_accumulated: {
    roleTitle: "The one whose hurt has not been heard",
    roleName: "Scholar Type",
    title: "Accumulated Emotion",
    oneLineSummary: "The pain you feel now did not appear suddenly. It may be made of many small disappointments that were not heard in time.",
    coreNeed: "You need to put the hurt on the table, instead of using endurance to keep the surface peaceful.",
    realMessage: "I am not trying to reopen old cases. I realized some hurt has never really been heard.",
    possibleMisread: "TA may think you are keeping score, and miss that you are asking to be understood.",
    betterExpression: "I want to talk about how this affected me, not declare you the wrong person.",
    strength: "The fact that you can organize these emotions means you are looking for an outlet, not just an explosion.",
    actions: ["Talk about one specific hurt at a time", "Describe the impact before assigning blame", "Turn old pain into one clear request"],
    shareableMessage: "I am not trying to dig up old fights. I want the hurt that was never heard to finally have a place to go.",
  },
  daily_disconnection: {
    roleTitle: "The one wanting to be included in everyday life",
    roleName: "Traveler Type",
    title: "Daily Disconnection",
    oneLineSummary: "What matters is not just time together, but whether you feel included in each other's daily rhythm.",
    coreNeed: "You need to be remembered, included, and naturally brought into everyday life.",
    realMessage: "I do not need grand plans. I want to feel that you are willing to let me be part of your life.",
    possibleMisread: "TA may think you only want more time, while you are really asking for participation.",
    betterExpression: "I hope we are not only meeting when there is time. I want a little more place in your everyday life.",
    strength: "Daily connection is often repairable because it depends less on big promises and more on repeated small gestures.",
    actions: ["Leave one real update each day", "Make time this week without rushing it", "Share small moments when they happen"],
    shareableMessage: "I do not need many arrangements. I just want to feel that you are willing to make room for me in your life.",
  },
  push_pull_close: {
    roleTitle: "The one wanting closeness without more hurt",
    roleName: "Guardian Type",
    title: "Push-Pull Closeness",
    oneLineSummary: "One of you may want immediate reassurance while the other needs room first, so closeness turns into chasing and retreating.",
    coreNeed: "You need both reassurance and rhythm: neither being dropped nor pushed into defense.",
    realMessage: "I want to be close to you, and I am also afraid we will hurt each other in the wrong way.",
    possibleMisread: "TA may only see the chasing or hiding, not the insecurity underneath.",
    betterExpression: "I want to come closer. Can we talk in a way that feels less pressured?",
    strength: "The push-pull means there is still attachment here. The key is to give closeness a safer rhythm.",
    actions: ["Confirm the relationship before discussing the problem", "Set a clear time limit for cooling down", "Say \"I need a little rhythm\" instead of disappearing"],
    shareableMessage: "I want to come closer to you. I just hope we can do it in a way that feels less pressured.",
  },
  boundary_sensitive: {
    roleTitle: "The one needing both space and understanding",
    roleName: "Boundary Keeper Type",
    title: "Boundary-Sensitive",
    oneLineSummary: "You are not trying to push the relationship away. You want closeness that still leaves room for yourself.",
    coreNeed: "You need respect, permission to slow down, and boundaries that are not misread as lack of love.",
    realMessage: "I need some space, but that does not mean I do not care.",
    possibleMisread: "TA may read your solitude, silence, or slower response as distance.",
    betterExpression: "I want to be quiet for a while. I am not leaving you. I will come back when I am steadier.",
    strength: "Clear boundaries can make the relationship steadier, not farther apart.",
    actions: ["Explain that alone time is not coldness", "Make boundaries specific in time and action", "Give the other person a clear signal that you will come back"],
    shareableMessage: "I need a little space, but I am not trying to leave you. I want to come back to you in a better state.",
  },
  aligned_growth: {
    roleTitle: "The one asking whether you are still on the same road",
    roleName: "Guide Type",
    title: "Growing Side by Side",
    oneLineSummary: "The point is not to define the whole relationship immediately, but to see whether you still want to adjust forward together.",
    coreNeed: "You need direction, shared planning, and the feeling that you are willing to solve things together.",
    realMessage: "I do not need every answer right away. I want to know whether we are still willing to find a way together.",
    possibleMisread: "TA may hear future talk as pressure, rather than a search for direction.",
    betterExpression: "I am not asking you to promise everything now. I just want to confirm the next small step with you.",
    strength: "As long as you can still discuss the next step together, the relationship is not trapped inside emotion alone.",
    actions: ["Set one small goal for this week", "Break worries into practical questions", "Review money, time, and plans once a week"],
    shareableMessage: "I am not asking for every answer right away. I just want to know whether we still want to think forward together.",
  },
};

function tagsForOption(option: OptionLike): string[] {
  const tags: string[] = [];
  const byDimension: Record<RelationshipDimension, string> = {
    security: "needs_reassurance",
    communication: "communication_gap",
    companionship: "daily_disconnection",
    repair: "repair_needed",
    intimacy: "intimacy_distance",
    future: "future_alignment",
  };

  tags.push(byDimension[option.dimension]);

  if (["space", "no_push", "quiet", "alone", "boundary"].includes(option.value)) tags.push("boundary_sensitive");
  if (["tired", "exhausted", "bury", "hurt", "emotion", "love_tired"].includes(option.value)) tags.push("emotion_accumulated");
  if (["care_less", "uncertain", "certainty", "confirm", "repeat"].includes(option.value)) tags.push("needs_reassurance");
  if (["time", "company", "daily", "night", "life", "date"].includes(option.value)) tags.push("daily_disconnection");
  if (["go_on", "better", "try", "plan", "future"].includes(option.value)) tags.push("future_alignment");

  return Array.from(new Set(tags));
}

function getDimensionLabel(dimension: RelationshipDimension, lang: Language) {
  return lang === "en" ? dimensionLabelsEn[dimension] : dimensionLabels[dimension];
}

function getTagLabel(tag: string, lang: Language) {
  return lang === "en" ? tagLabelsEn[tag] : tagLibrary[tag]?.label;
}

function getTemplate(template: PatternTemplate, lang: Language) {
  return lang === "en" ? { ...template, ...patternTemplateEn[template.key] } : template;
}

function evidenceFor(question: QuestionLike, option: OptionLike, tags: string[], lang: Language) {
  const tagText = tags.map(tag => getTagLabel(tag, lang)).filter(Boolean).join(lang === "en" ? ", " : "、");
  if (lang === "en") {
    return `In "${question.title}", you chose "${option.label}", which points to ${tagText || getDimensionLabel(option.dimension, lang)}.`;
  }

  return `在「${question.title}」里，你选择了「${option.label}」，这更像是在表达${tagText || getDimensionLabel(option.dimension, lang)}。`;
}

function sourceKeysForTags(tags: string[]) {
  const keys = tags.flatMap(tag => tagLibrary[tag]?.sourceKeys ?? []);
  return Array.from(new Set(keys)) as SourceKey[];
}

function answerEvidence(questions: QuestionLike[], answers: AnswerMap, lang: Language): AnswerEvidence[] {
  return questions.flatMap(question => {
    const option = question.options.find(item => item.value === answers[question.id]);
    if (!option) return [];
    const tags = tagsForOption(option);
    return [{
      questionTitle: question.title,
      answerLabel: option.label,
      dimension: option.dimension,
      weight: option.weight,
      tags,
      evidence: evidenceFor(question, option, tags, lang),
      sourceKeys: sourceKeysForTags(tags),
    }];
  });
}

function countItems(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

function topKey(counts: Record<string, number>, fallback: string) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback;
}

function chooseTemplate(evidence: AnswerEvidence[], score: ScoreLike) {
  const tagCounts = countItems(evidence.flatMap(item => item.tags));
  const dimensionCounts = countItems(evidence.map(item => item.dimension));

  return patternTemplates
    .map(template => {
      const tagScore = template.triggerTags.reduce((sum, tag) => sum + (tagCounts[tag] ?? 0) * 3, 0);
      const dimensionScore = template.triggerDimensions.reduce((sum, dimension) => sum + (dimensionCounts[dimension] ?? 0), 0);
      const weakestBonus = template.triggerDimensions.includes(score.weakest as RelationshipDimension) ? 2 : 0;
      return { template, score: tagScore + dimensionScore + weakestBonus };
    })
    .sort((a, b) => b.score - a.score)[0]?.template ?? patternTemplates[0];
}

function pickEvidence(evidence: AnswerEvidence[]) {
  return [...evidence]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
}

function pickSources(template: PatternTemplate, evidence: AnswerEvidence[], lang: Language) {
  const keys = [
    ...template.sourceKeys,
    ...evidence.flatMap(item => item.sourceKeys),
  ];
  const cards = lang === "en" ? sourceCardsEn : sourceCards;
  return Array.from(new Set(keys)).slice(0, 3).map(key => cards[key]);
}

function buildLongFormInsight(params: {
  template: PatternTemplate;
  evidence: AnswerEvidence[];
  sources: SourceCard[];
  hasPartner: boolean;
  lang: Language;
}) {
  const firstEvidence = params.evidence[0]?.evidence;
  const secondEvidence = params.evidence[1]?.evidence;
  const sourceNames = params.sources.map(source => source.title).slice(0, 2).join(params.lang === "en" ? " and " : "、");
  const actionLine = params.template.actions.slice(0, 3).join(params.lang === "en" ? "; " : "；");

  if (params.lang === "en") {
    const evidenceLine = [firstEvidence, secondEvidence].filter(Boolean).join(" ");
    return [
      `Dear you, this reflection reads your current relationship rhythm as closer to "${params.template.title}". ${params.template.oneLineSummary} This does not mean you are fixed as this type. It simply means that, in this round of answers, this is the emotional doorway that showed up most clearly.`,
      `What you may be asking for is not a perfect partner or a flawless relationship. The deeper need is this: ${params.template.coreNeed} When this need is not met, small moments can start to feel larger than they look from the outside.`,
      evidenceLine ? `This reading is not based on one answer alone. Several choices pointed in the same direction: ${evidenceLine}` : "",
      `The most tender part is the misunderstanding. What you mean is often closer to "${params.template.realMessage}", but TA may hear it as "${params.template.possibleMisread}" Once this happens, both people can begin protecting themselves instead of reaching for each other.`,
      `A softer sentence to begin with would be: "${params.template.betterExpression}" It gives TA a clearer way to respond, and it also protects your own feeling from being hidden behind testing, silence, or sharp questions.`,
      params.hasPartner
        ? "Because this is a two-person reflection, please read it as a comparison of rhythms rather than a verdict about who is right. The useful question is not who loves more, but what kind of response helps both people return to the same side."
        : "Because this is a solo reflection, please read it as a mirror for this moment, not as a final conclusion about the relationship. A feeling can be real without needing to become a verdict immediately.",
      actionLine ? `Over the next seven days, start very small: ${actionLine}. The goal is not to solve the whole relationship at once, but to create one repeatable way back into contact.` : "",
      sourceNames ? `The reference cards include ${sourceNames} because the report is grounded in relationship ideas about responsiveness, repair, and request-based communication, not in a fixed label about your personality.` : "",
      `One sentence to keep: "${params.template.shareableMessage}"`,
    ].filter(Boolean).join("\n\n");
  }

  const evidenceLine = [firstEvidence, secondEvidence].filter(Boolean).join("");
  return [
    `亲爱的你：这次复盘里，我看到你的关系主线更接近「${params.template.title}」。${params.template.oneLineSummary} 这不是给你贴上一个固定标签，而是说，在这一轮回答里，这个部分最先浮出了水面，也最值得被温柔地看见。`,
    `你真正想要的，可能不是一个永远不会出错的恋人，也不是一段完全没有矛盾的关系。你更深处的需要是：${params.template.coreNeed} 当这个需要没有被接住时，一些看起来很小的事情，就会慢慢变得很重。`,
    evidenceLine ? `这个判断不是从单个答案直接跳出来的，而是来自几类相互呼应的选择：${evidenceLine}` : "",
    `真正需要放慢看的，是你们之间可能发生的误读。你想表达的更像是「${params.template.realMessage}」，但 TA 可能听成「${params.template.possibleMisread}」。一旦误读发生，两个人就容易从“想靠近”变成“先保护自己”。`,
    `所以这份来信想替你把话说得更轻一点。你可以试着从这句话开始：「${params.template.betterExpression}」它比试探更清楚，比反问更柔软，也更容易让对方知道自己可以怎么回应你。`,
    params.hasPartner
      ? "因为这是双人复盘，所以它不是在判断谁更对，而是在比较你们的关系节奏。真正有价值的问题不是谁更爱谁，而是哪一种回应方式能让两个人重新回到同一边。"
      : "因为这是单人复盘，所以它更像一面镜子：帮你先看清此刻的感受和需求，不替你给关系下最终结论。感受是真的，但感受不一定要马上变成判决。",
    actionLine ? `接下来 7 天，不用急着把整段关系一次性修好。你可以先从很小的动作开始：${actionLine}。关系里真正有用的改变，往往不是一句很大的承诺，而是一个可以反复做到的小入口。` : "",
    sourceNames ? `资料依据里会出现「${sourceNames}」，是因为这些资料都指向同一个方向：关系里的安全感、亲密感和修复力，通常不是靠一次解释建立的，而是靠被回应、可修复、可请求的小动作反复累积。` : "",
    `最后，把这句话留给你：${params.template.shareableMessage}`,
  ].filter(Boolean).join("\n\n");
}

function buildLongFormHighlight(template: PatternTemplate, lang: Language) {
  if (lang === "en") {
    return `Key reminder: this result is not deciding who is right. The part that deserves the most care first is ${template.coreNeed}`;
  }

  return `重点提醒：这份结果不是在判断谁对谁错，而是在提示你们最需要先照顾的是：${template.coreNeed}`;
}

export function buildRelationshipReport(params: {
  questions: QuestionLike[];
  answers: AnswerMap;
  score: ScoreLike;
  hasPartner: boolean;
  lang?: Language;
}): RelationshipReport {
  const lang = params.lang ?? "zh";
  const evidence = answerEvidence(params.questions, params.answers, lang);
  const template = getTemplate(chooseTemplate(evidence, params.score), lang);
  const selectedEvidence = pickEvidence(evidence);
  const sources = pickSources(template, selectedEvidence, lang);

  return {
    roleTitle: template.roleTitle,
    roleName: template.roleName,
    roleSymbol: template.roleSymbol,
    patternTitle: template.title,
    oneLineSummary: template.oneLineSummary,
    longFormInsight: buildLongFormInsight({
      template,
      evidence: selectedEvidence,
      sources,
      hasPartner: params.hasPartner,
      lang,
    }),
    longFormHighlight: buildLongFormHighlight(template, lang),
    coreNeed: template.coreNeed,
    realMessage: template.realMessage,
    possibleMisread: template.possibleMisread,
    betterExpression: template.betterExpression,
    strength: template.strength,
    actions: template.actions,
    shareableMessage: template.shareableMessage,
    evidence: selectedEvidence,
    sources,
    credibilityNote: params.hasPartner
      ? lang === "en"
        ? `This result is based on both of your answers to the same ${params.questions.length} questions. It is only a reflection snapshot for this moment, not a psychological diagnosis or relationship verdict.`
        : `这份结果基于你们两个人同一组 ${params.questions.length} 道题的选择生成，只代表此刻的关系复盘快照，不作为心理诊断或关系结论。`
      : lang === "en"
        ? `This result is based on ${params.questions.length} randomly selected questions and your answers. It is only a snapshot of how things feel right now, not a psychological diagnosis or relationship verdict.`
        : `这份结果基于本轮随机抽取的 ${params.questions.length} 道题和你的选择生成，只代表此刻的感受快照，不作为心理诊断或关系结论。`,
  };
}

export function buildDuoRelationshipReport(params: {
  questions: QuestionLike[];
  answers: AnswerMap;
  partnerAnswers: AnswerMap;
  score: ScoreLike;
  partnerScore: ScoreLike;
  lang?: Language;
}): DuoRelationshipReport {
  const lang = params.lang ?? "zh";
  const base = buildRelationshipReport({
    questions: params.questions,
    answers: params.answers,
    score: params.score,
    hasPartner: true,
    lang,
  });
  const partnerEvidence = answerEvidence(params.questions, params.partnerAnswers, lang);
  const userTopTag = topKey(countItems(base.evidence.flatMap(item => item.tags)), "needs_reassurance");
  const partnerTopTag = topKey(countItems(partnerEvidence.flatMap(item => item.tags)), "repair_needed");
  const userNeed = getTagLabel(userTopTag, lang) ?? getDimensionLabel(params.score.weakest as RelationshipDimension, lang) ?? (lang === "en" ? "to be understood" : "被理解");
  const partnerNeed = getTagLabel(partnerTopTag, lang) ?? getDimensionLabel(params.partnerScore.weakest as RelationshipDimension, lang) ?? (lang === "en" ? "to be understood" : "被理解");

  return {
    ...base,
    sharedNeed: params.score.strongest === params.partnerScore.strongest
      ? lang === "en"
        ? `Both of you still have strength in "${getDimensionLabel(params.score.strongest as RelationshipDimension, lang) ?? "caring about each other"}". This is a shared point you can hold onto first.`
        : `你们都在「${getDimensionLabel(params.score.strongest as RelationshipDimension, lang) ?? "在乎彼此"}」上保留了力量，这是可以先抓住的共同点。`
      : lang === "en"
        ? "Your answers are not exactly the same, but both of you are trying to find a clearer entrance back into the relationship."
        : "你们的答案虽然不完全相同，但都在尝试给关系找到一个更清楚的入口。",
    userNeed,
    partnerNeed,
    conflictCycle: lang === "en"
      ? `When you are looking for ${userNeed}, TA may be needing ${partnerNeed}. If this is not named clearly, one person may feel pushed away while the other feels pressured.`
      : `当你更想要${userNeed}时，TA 可能更需要${partnerNeed}。如果没有说清楚，一个人会觉得被推开，另一个人会觉得被逼近。`,
    agreement: lang === "en"
      ? "When emotions rise, we can pause first, but we should name when we will come back. Pausing is not disappearing, and coming back is not continuing the attack."
      : "如果我们情绪上来，可以先暂停，但要说清楚几点回来继续聊；暂停不是消失，回来也不是继续攻击。",
  };
}
