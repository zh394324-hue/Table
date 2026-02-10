import { useState, useEffect, useCallback, useRef } from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface DeletedTask {
  task: Task;
  dayIndex: number;
  originalIndex: number;
  deletedAt: number;
}

interface DaySchedule {
  day: string;
  emoji: string;
  subjects: string[];
  description: string;
  color: string;
  gradient: string;
  borderColor: string;
  bgLight: string;
  iconBg: string;
  tasks: Task[];
  isRest?: boolean;
  restTasks?: string[];
}

const STORAGE_KEY = "weekly-schedule-data-v2";
const DELETED_KEY = "weekly-schedule-deleted";

const defaultSchedule: DaySchedule[] = [
  {
    day: "السبت",
    emoji: "📘",
    subjects: ["رياضة بحتة"],
    description: "تقيلة لوحدها 💪",
    color: "text-blue-700",
    gradient: "from-blue-500 to-blue-700",
    borderColor: "border-blue-300",
    bgLight: "bg-blue-50",
    iconBg: "bg-blue-100",
    tasks: [
      { id: "sat-1", text: "مراجعة القوانين الأساسية", completed: false },
      { id: "sat-2", text: "حل تمارين الفصل", completed: false },
      { id: "sat-3", text: "حل مسائل متقدمة", completed: false },
    ],
  },
  {
    day: "الأحد",
    emoji: "📕",
    subjects: ["رياضة تطبيقية"],
    description: "تقيلة لوحدها 💪",
    color: "text-red-700",
    gradient: "from-red-500 to-red-700",
    borderColor: "border-red-300",
    bgLight: "bg-red-50",
    iconBg: "bg-red-100",
    tasks: [
      { id: "sun-1", text: "مراجعة القوانين الأساسية", completed: false },
      { id: "sun-2", text: "حل تمارين تطبيقية", completed: false },
      { id: "sun-3", text: "حل مسائل سنوات سابقة", completed: false },
    ],
  },
  {
    day: "الاثنين",
    emoji: "📗",
    subjects: ["فيزياء"],
    description: "تقيلة لوحدها 💪",
    color: "text-green-700",
    gradient: "from-green-500 to-green-700",
    borderColor: "border-green-300",
    bgLight: "bg-green-50",
    iconBg: "bg-green-100",
    tasks: [
      { id: "mon-1", text: "مراجعة القوانين والنظريات", completed: false },
      { id: "mon-2", text: "حل مسائل الفصل", completed: false },
      { id: "mon-3", text: "تجارب عملية / فيديوهات", completed: false },
    ],
  },
  {
    day: "الثلاثاء",
    emoji: "📙",
    subjects: ["كيمياء"],
    description: "تقيلة لوحدها 💪",
    color: "text-orange-700",
    gradient: "from-orange-500 to-orange-700",
    borderColor: "border-orange-300",
    bgLight: "bg-orange-50",
    iconBg: "bg-orange-100",
    tasks: [
      { id: "tue-1", text: "مراجعة المعادلات والتفاعلات", completed: false },
      { id: "tue-2", text: "حل مسائل حسابية", completed: false },
      { id: "tue-3", text: "مراجعة الجزء النظري", completed: false },
    ],
  },
  {
    day: "الأربعاء",
    emoji: "📓",
    subjects: ["إنجليزي", "ألماني"],
    description: "اتنين لغات – سهلين نسبيًا مع بعض 🌍",
    color: "text-purple-700",
    gradient: "from-purple-500 to-purple-700",
    borderColor: "border-purple-300",
    bgLight: "bg-purple-50",
    iconBg: "bg-purple-100",
    tasks: [
      { id: "wed-1", text: "حفظ كلمات إنجليزي جديدة", completed: false },
      { id: "wed-2", text: "قراءة أو استماع إنجليزي", completed: false },
      { id: "wed-3", text: "حفظ كلمات ألماني جديدة", completed: false },
      { id: "wed-4", text: "تمارين قواعد ألماني", completed: false },
    ],
  },
  {
    day: "الخميس",
    emoji: "📔",
    subjects: ["عربي", "تاريخ"],
    description: "مواد حفظ وفهم خفيف 📖",
    color: "text-amber-700",
    gradient: "from-amber-500 to-amber-700",
    borderColor: "border-amber-300",
    bgLight: "bg-amber-50",
    iconBg: "bg-amber-100",
    tasks: [
      { id: "thu-1", text: "مراجعة نصوص ونحو عربي", completed: false },
      { id: "thu-2", text: "حفظ أبيات أو بلاغة", completed: false },
      { id: "thu-3", text: "مراجعة فصل تاريخ", completed: false },
      { id: "thu-4", text: "تلخيص أحداث مهمة", completed: false },
    ],
  },
  {
    day: "الجمعة",
    emoji: "🔁",
    subjects: ["مراجعة خفيفة / راحة"],
    description: "يوم خفيف ومرن 😌",
    color: "text-teal-700",
    gradient: "from-teal-500 to-teal-700",
    borderColor: "border-teal-300",
    bgLight: "bg-teal-50",
    iconBg: "bg-teal-100",
    isRest: true,
    restTasks: ["تثبيت قوانين", "كلمات", "حل سؤال أو اتنين بس"],
    tasks: [
      { id: "fri-1", text: "تثبيت قوانين", completed: false },
      { id: "fri-2", text: "مراجعة كلمات", completed: false },
      { id: "fri-3", text: "حل سؤال أو اتنين بس", completed: false },
    ],
  },
];

function getCurrentDayIndex(): number {
  const jsDay = new Date().getDay();
  const mapping: Record<number, number> = {
    6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6,
  };
  return mapping[jsDay];
}

let idCounter = Date.now();
function generateId(): string {
  return `task-${idCounter++}`;
}

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: "success" | "info" | "undo"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`
      flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl
      animate-slide-up
      ${type === "success" ? "bg-green-950/90 border-green-500/30 text-green-200" : ""}
      ${type === "info" ? "bg-blue-950/90 border-blue-500/30 text-blue-200" : ""}
      ${type === "undo" ? "bg-amber-950/90 border-amber-500/30 text-amber-200" : ""}
    `}>
      <span className="text-lg">
        {type === "success" ? "✅" : type === "undo" ? "🔄" : "ℹ️"}
      </span>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="text-white/50 hover:text-white/80 cursor-pointer transition-colors mr-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Confirmation Modal
function ConfirmModal({
  isOpen, title, message, confirmText, onConfirm, onCancel, danger = true,
}: {
  isOpen: boolean; title: string; message: string; confirmText: string;
  onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-slate-800 border border-slate-600 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">{danger ? "⚠️" : "❓"}</div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-400 text-sm mb-8">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className={`flex-1 px-5 py-3 font-bold rounded-xl transition-all duration-300 cursor-pointer active:scale-95 shadow-lg text-white ${
                danger
                  ? "bg-gradient-to-l from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 shadow-red-900/30"
                  : "bg-gradient-to-l from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-blue-900/30"
              }`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-5 py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-all duration-300 cursor-pointer active:scale-95"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return defaultSchedule;
  });

  const [deletedTasks, setDeletedTasks] = useState<DeletedTask[]>(() => {
    try {
      const saved = localStorage.getItem(DELETED_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });

  const [activeDay, setActiveDay] = useState<number>(getCurrentDayIndex());
  const [animatingTask, setAnimatingTask] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showDeletedPanel, setShowDeletedPanel] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" | "undo" }[]>([]);

  const editInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; confirmText: string;
    onConfirm: () => void; danger?: boolean;
  }>({ isOpen: false, title: "", message: "", confirmText: "", onConfirm: () => {}, danger: true });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(DELETED_KEY, JSON.stringify(deletedTasks));
  }, [deletedTasks]);

  // Focus input on edit
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId]);

  useEffect(() => {
    if (showAddTask && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddTask]);

  const addToast = useCallback((message: string, type: "success" | "info" | "undo") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Toggle task completion
  const toggleTask = useCallback((dayIndex: number, taskId: string) => {
    setAnimatingTask(taskId);
    setTimeout(() => setAnimatingTask(null), 500);
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              tasks: day.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
          : day
      )
    );
  }, []);

  // Delete a task
  const deleteTask = useCallback((dayIndex: number, taskId: string) => {
    setSchedule((prev) => {
      const day = prev[dayIndex];
      const taskIndex = day.tasks.findIndex((t) => t.id === taskId);
      const task = day.tasks[taskIndex];
      if (task) {
        setDeletedTasks((dt) => [
          { task: { ...task }, dayIndex, originalIndex: taskIndex, deletedAt: Date.now() },
          ...dt,
        ]);
        addToast(`تم حذف "${task.text}"`, "undo");
      }
      return prev.map((d, i) =>
        i === dayIndex
          ? { ...d, tasks: d.tasks.filter((t) => t.id !== taskId) }
          : d
      );
    });
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
    }
  }, [editingTaskId, addToast]);

  // Restore a deleted task
  const restoreTask = useCallback((deletedIndex: number) => {
    const deleted = deletedTasks[deletedIndex];
    if (!deleted) return;

    setSchedule((prev) =>
      prev.map((day, i) => {
        if (i !== deleted.dayIndex) return day;
        const newTasks = [...day.tasks];
        const insertAt = Math.min(deleted.originalIndex, newTasks.length);
        newTasks.splice(insertAt, 0, { ...deleted.task });
        return { ...day, tasks: newTasks };
      })
    );

    setDeletedTasks((prev) => prev.filter((_, i) => i !== deletedIndex));
    addToast(`تم استرجاع "${deleted.task.text}" ليوم ${schedule[deleted.dayIndex].day}`, "success");
  }, [deletedTasks, addToast, schedule]);

  // Permanently remove from deleted
  const permanentlyDelete = useCallback((deletedIndex: number) => {
    const deleted = deletedTasks[deletedIndex];
    setDeletedTasks((prev) => prev.filter((_, i) => i !== deletedIndex));
    if (deleted) {
      addToast(`تم حذف "${deleted.task.text}" نهائيًا`, "info");
    }
  }, [deletedTasks, addToast]);

  // Clear all deleted tasks
  const clearAllDeleted = useCallback(() => {
    setDeletedTasks([]);
    addToast("تم تفريغ سلة المحذوفات", "info");
  }, [addToast]);

  // Start editing a task
  const startEditing = useCallback((taskId: string, currentText: string) => {
    setEditingTaskId(taskId);
    setEditText(currentText);
  }, []);

  // Save edit
  const saveEdit = useCallback((dayIndex: number, taskId: string) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              tasks: day.tasks.map((t) =>
                t.id === taskId ? { ...t, text: trimmed } : t
              ),
            }
          : day
      )
    );
    setEditingTaskId(null);
    setEditText("");
    addToast("تم تعديل المهمة بنجاح", "success");
  }, [editText, addToast]);

  // Cancel edit
  const cancelEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditText("");
  }, []);

  // Add new task
  const addTask = useCallback((dayIndex: number) => {
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    const newTask: Task = {
      id: generateId(),
      text: trimmed,
      completed: false,
    };
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === dayIndex
          ? { ...day, tasks: [...day.tasks, newTask] }
          : day
      )
    );
    setNewTaskText("");
    setShowAddTask(false);
    addToast("تم إضافة مهمة جديدة", "success");
  }, [newTaskText, addToast]);

  // Reset day
  const resetDay = useCallback((dayIndex: number) => {
    setSchedule((prev) =>
      prev.map((day, i) =>
        i === dayIndex
          ? { ...day, tasks: day.tasks.map((t) => ({ ...t, completed: false })) }
          : day
      )
    );
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    setSchedule(defaultSchedule);
    setDeletedTasks([]);
  }, []);

  const showResetDayConfirm = (dayIndex: number, dayName: string) => {
    setConfirmModal({
      isOpen: true,
      title: `إعادة تعيين يوم ${dayName}؟`,
      message: `هيتم مسح كل التقدم اللي عملته في يوم ${dayName}. متقلقش تقدر تبدأ من جديد!`,
      confirmText: "أيوه، إعادة تعيين",
      onConfirm: () => {
        resetDay(dayIndex);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        addToast(`تم إعادة تعيين يوم ${dayName}`, "info");
      },
    });
  };

  const showResetAllConfirm = () => {
    setConfirmModal({
      isOpen: true,
      title: "إعادة تعيين الأسبوع كله؟",
      message: "هيتم مسح كل التقدم والمهام المضافة والمحذوفة! كل حاجة هترجع زي الأول.",
      confirmText: "أيوه، إعادة تعيين الكل",
      onConfirm: () => {
        resetAll();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        addToast("تم إعادة تعيين الأسبوع كله", "info");
      },
    });
  };

  const showDeleteConfirm = (dayIndex: number, taskId: string, taskText: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف المهمة؟",
      message: `هيتم حذف "${taskText}". تقدر ترجعها تاني من سلة المحذوفات.`,
      confirmText: "أيوه، احذفها",
      onConfirm: () => {
        deleteTask(dayIndex, taskId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const closeModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const getProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
  };

  const totalTasks = schedule.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = schedule.reduce(
    (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
    0
  );
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const todayIndex = getCurrentDayIndex();
  const deletedForActiveDay = deletedTasks.filter((d) => d.dayIndex === activeDay);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans">
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeModal}
        danger={confirmModal.danger}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>

      {/* Deleted Tasks Side Panel */}
      {showDeletedPanel && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDeletedPanel(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute top-0 left-0 h-full w-full max-w-md bg-slate-900 border-r border-slate-700 shadow-2xl animate-slide-right overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🗑️</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">سلة المحذوفات</h2>
                    <p className="text-xs text-slate-400">{deletedTasks.length} مهمة محذوفة</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeletedPanel(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {deletedTasks.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-6xl block mb-4">🎉</span>
                  <p className="text-slate-400 text-lg">سلة المحذوفات فاضية</p>
                  <p className="text-slate-500 text-sm mt-2">مفيش مهام محذوفة</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: "تفريغ سلة المحذوفات؟",
                        message: "هيتم حذف كل المهام المحذوفة نهائيًا ومش هتقدر ترجعها تاني!",
                        confirmText: "أيوه، فرّغها",
                        onConfirm: () => {
                          clearAllDeleted();
                          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                        },
                      });
                    }}
                    className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-red-950/50 hover:bg-red-900/50 border border-red-500/20 hover:border-red-500/40 text-red-300 rounded-xl transition-all cursor-pointer text-sm font-bold"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    تفريغ السلة كلها
                  </button>

                  <div className="space-y-3">
                    {deletedTasks.map((deleted, index) => (
                      <div
                        key={`deleted-${deleted.task.id}-${deleted.deletedAt}`}
                        className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="text-slate-300 text-sm mb-1">{deleted.task.text}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                {schedule[deleted.dayIndex]?.emoji} {schedule[deleted.dayIndex]?.day}
                              </span>
                              <span className="text-xs text-slate-600">•</span>
                              <span className="text-xs text-slate-500">
                                {deleted.task.completed ? "✅ كانت مكتملة" : "⬜ كانت غير مكتملة"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => restoreTask(index)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-950/50 hover:bg-green-900/50 border border-green-500/20 hover:border-green-500/40 text-green-300 rounded-xl transition-all cursor-pointer text-sm font-bold"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            استرجاع
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: "حذف نهائي؟",
                                message: `هيتم حذف "${deleted.task.text}" نهائيًا ومش هتقدر ترجعها!`,
                                confirmText: "احذف نهائيًا",
                                onConfirm: () => {
                                  permanentlyDelete(index);
                                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                                },
                              });
                            }}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-950/50 hover:bg-red-900/50 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl transition-all cursor-pointer text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">🗓️</span>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-l from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
              الجدول الأسبوعي
            </h1>
          </div>
          <p className="text-slate-400 text-lg">كل يوم مادة – مع تجميع السهل مع بعضه 💡</p>

          {/* Overall Progress */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">التقدم الكلي للأسبوع</span>
              <span className="text-sm font-bold text-white">
                {completedTasks}/{totalTasks} مهام
              </span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-l from-blue-500 via-purple-500 to-teal-500 transition-all duration-700 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-sm text-slate-400">{overallProgress}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={showResetAllConfirm}
              className="group inline-flex items-center gap-3 px-5 py-3 bg-slate-800/80 hover:bg-red-950/80 border-2 border-slate-600 hover:border-red-500/60 text-slate-300 hover:text-red-300 rounded-2xl transition-all duration-300 cursor-pointer active:scale-95 shadow-lg hover:shadow-red-900/20"
            >
              <svg className="w-5 h-5 group-hover:animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-bold text-sm">إعادة تعيين الكل</span>
            </button>
            <button
              onClick={() => setShowDeletedPanel(true)}
              className="group inline-flex items-center gap-3 px-5 py-3 bg-slate-800/80 hover:bg-amber-950/80 border-2 border-slate-600 hover:border-amber-500/60 text-slate-300 hover:text-amber-300 rounded-2xl transition-all duration-300 cursor-pointer active:scale-95 shadow-lg hover:shadow-amber-900/20"
            >
              <span className="text-lg">🗑️</span>
              <span className="font-bold text-sm">سلة المحذوفات</span>
              {deletedTasks.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full font-bold border border-amber-500/30">
                  {deletedTasks.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Day Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide justify-center flex-wrap">
          {schedule.map((day, index) => {
            const progress = getProgress(day.tasks);
            const isToday = index === todayIndex;
            const isActive = index === activeDay;
            return (
              <button
                key={day.day}
                onClick={() => {
                  setActiveDay(index);
                  setEditingTaskId(null);
                  setShowAddTask(false);
                }}
                className={`
                  relative flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer min-w-[80px]
                  ${isActive
                    ? `bg-gradient-to-b ${day.gradient} shadow-lg shadow-slate-900/50 scale-105`
                    : "bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50"
                  }
                  ${isToday && !isActive ? "ring-2 ring-yellow-400/50" : ""}
                `}
              >
                {isToday && (
                  <span className="absolute -top-1.5 -left-1.5 text-xs">⭐</span>
                )}
                <span className="text-xl">{day.emoji}</span>
                <span className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-300"}`}>
                  {day.day}
                </span>
                {progress === 100 && day.tasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-sm">✅</span>
                )}
                {progress > 0 && progress < 100 && (
                  <div className="w-full h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-l ${day.gradient} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Day Card */}
        {schedule.map((day, dayIndex) => {
          if (dayIndex !== activeDay) return null;
          const progress = getProgress(day.tasks);
          const completedCount = day.tasks.filter((t) => t.completed).length;
          const hasAnyCompleted = completedCount > 0;
          return (
            <div
              key={day.day}
              className={`
                relative overflow-hidden rounded-3xl border ${day.borderColor}/30
                bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl
                shadow-2xl shadow-black/20
              `}
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-l ${day.gradient} p-6 md:p-8`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{day.emoji}</span>
                      <div>
                        <h2 className="text-3xl font-bold text-white">{day.day}</h2>
                        {dayIndex === todayIndex && (
                          <span className="inline-block mt-1 px-3 py-0.5 bg-yellow-400/20 text-yellow-200 text-xs rounded-full border border-yellow-400/30">
                            ⭐ اليوم
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {day.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white border border-white/20"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-white/80 text-sm">{day.description}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                        <circle
                          cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 34}`}
                          strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-200">
                    📋 المهام ({completedCount}/{day.tasks.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    {deletedForActiveDay.length > 0 && (
                      <button
                        onClick={() => setShowDeletedPanel(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 rounded-lg transition-all cursor-pointer text-xs"
                      >
                        🗑️ محذوفات ({deletedForActiveDay.length})
                      </button>
                    )}
                  </div>
                </div>

                {day.tasks.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="text-5xl block mb-3">📭</span>
                    <p className="text-slate-400">مفيش مهام لسه</p>
                    <p className="text-slate-500 text-sm mt-1">اضغط على "إضافة مهمة" عشان تضيف</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {day.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`
                          group relative rounded-2xl transition-all duration-300 overflow-hidden
                          ${task.completed
                            ? "bg-slate-800/30 border border-slate-700/30"
                            : `bg-slate-800/40 border border-slate-700/50 hover:border-slate-600`
                          }
                          ${animatingTask === task.id ? "scale-[1.02]" : ""}
                        `}
                      >
                        {editingTaskId === task.id ? (
                          /* Edit Mode */
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-lg">✏️</span>
                              <span className="text-sm font-bold text-slate-300">تعديل المهمة</span>
                            </div>
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(dayIndex, task.id);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white text-right placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                              placeholder="اكتب نص المهمة..."
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => saveEdit(dayIndex, task.id)}
                                disabled={!editText.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-l from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                حفظ
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl transition-all cursor-pointer active:scale-95 text-sm"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal Mode */
                          <div className="flex items-center gap-3 p-4">
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleTask(dayIndex, task.id)}
                              className={`
                                flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 cursor-pointer
                                ${task.completed
                                  ? `bg-gradient-to-br ${day.gradient} border-transparent`
                                  : `border-slate-600 hover:border-slate-400`
                                }
                              `}
                            >
                              {task.completed && (
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>

                            {/* Task Text */}
                            <span
                              className={`
                                flex-1 transition-all duration-300 text-right
                                ${task.completed ? "text-slate-500 line-through" : "text-slate-200"}
                              `}
                            >
                              {task.text}
                            </span>

                            {task.completed && <span className="text-lg">🎉</span>}

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* Edit button */}
                              <button
                                onClick={() => startEditing(task.id, task.text)}
                                className="p-2 rounded-lg bg-slate-700/60 hover:bg-blue-900/60 text-slate-400 hover:text-blue-300 transition-all cursor-pointer border border-transparent hover:border-blue-500/30"
                                title="تعديل"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {/* Delete button */}
                              <button
                                onClick={() => showDeleteConfirm(dayIndex, task.id, task.text)}
                                className="p-2 rounded-lg bg-slate-700/60 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition-all cursor-pointer border border-transparent hover:border-red-500/30"
                                title="حذف"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Task */}
                {showAddTask ? (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-800/60 border-2 border-dashed border-slate-600 animate-fade-in">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg">➕</span>
                      <span className="text-sm font-bold text-slate-300">إضافة مهمة جديدة</span>
                    </div>
                    <input
                      ref={addInputRef}
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask(dayIndex);
                        if (e.key === "Escape") {
                          setShowAddTask(false);
                          setNewTaskText("");
                        }
                      }}
                      className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white text-right placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="اكتب اسم المهمة..."
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => addTask(dayIndex)}
                        disabled={!newTaskText.trim()}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-l ${day.gradient} hover:opacity-90 text-white font-bold rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-sm`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        إضافة
                      </button>
                      <button
                        onClick={() => {
                          setShowAddTask(false);
                          setNewTaskText("");
                        }}
                        className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl transition-all cursor-pointer active:scale-95 text-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddTask(true)}
                    className={`mt-4 w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-800/40 hover:bg-slate-800/60 border-2 border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-bold">إضافة مهمة جديدة</span>
                  </button>
                )}

                {/* Reset Day Button */}
                {hasAnyCompleted && (
                  <div className="mt-4">
                    <button
                      onClick={() => showResetDayConfirm(dayIndex, day.day)}
                      className="group w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-800/40 hover:bg-red-950/60 border border-slate-700/50 hover:border-red-500/50 text-slate-500 hover:text-red-300 rounded-2xl transition-all duration-300 cursor-pointer active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5 group-hover:animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="font-bold text-sm">إعادة تعيين يوم {day.day}</span>
                    </button>
                  </div>
                )}

                {/* Completion message */}
                {progress === 100 && day.tasks.length > 0 && (
                  <div className={`mt-6 p-5 rounded-2xl bg-gradient-to-l ${day.gradient}/10 border ${day.borderColor}/20 text-center`}>
                    <span className="text-4xl block mb-2">🏆</span>
                    <p className="text-lg font-bold text-white">أحسنت! خلصت كل مهام {day.day}!</p>
                    <p className="text-sm text-slate-400 mt-1">كمّل على الباقي 💪</p>
                  </div>
                )}

                {/* Rest day special section */}
                {day.isRest && (
                  <div className="mt-6 p-5 rounded-2xl bg-teal-500/5 border border-teal-500/20">
                    <p className="text-teal-300 font-bold mb-3">💡 نصائح ليوم الراحة:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-slate-400 text-sm">
                        <span>🧘</span> خد راحة كويسة – متحملش نفسك
                      </li>
                      <li className="flex items-center gap-2 text-slate-400 text-sm">
                        <span>📝</span> راجع الحاجات اللي مش فاهمها من الأسبوع
                      </li>
                      <li className="flex items-center gap-2 text-slate-400 text-sm">
                        <span>🎯</span> حط أهدافك للأسبوع الجاي
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Weekly Overview Grid */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-200">📊 نظرة عامة على الأسبوع</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {schedule.map((day, index) => {
              const progress = getProgress(day.tasks);
              const isToday = index === todayIndex;
              const dayHasCompleted = day.tasks.some((t) => t.completed);
              return (
                <div
                  key={`overview-${day.day}`}
                  className={`
                    relative p-4 rounded-2xl border transition-all duration-300 group
                    ${isToday
                      ? `border-yellow-400/30 bg-slate-800/80`
                      : "border-slate-700/30 bg-slate-800/40"
                    }
                  `}
                >
                  {isToday && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-400/30">
                      اليوم
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setActiveDay(index);
                      setEditingTaskId(null);
                      setShowAddTask(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full text-center cursor-pointer"
                  >
                    <span className="text-2xl block mb-1">{day.emoji}</span>
                    <span className="text-xs font-bold text-slate-300 block mb-2">{day.day}</span>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full bg-gradient-to-l ${day.gradient} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{progress}%</span>
                  </button>
                  {progress === 100 && day.tasks.length > 0 && (
                    <span className="absolute -top-1 -right-1 text-sm">✅</span>
                  )}
                  {dayHasCompleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showResetDayConfirm(index, day.day);
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-700/40 hover:bg-red-900/40 text-slate-500 hover:text-red-400 text-xs transition-all duration-200 cursor-pointer border border-transparent hover:border-red-500/30"
                      title={`إعادة تعيين يوم ${day.day}`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>إعادة تعيين</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800/60 border border-slate-700/50">
            <span className="text-xl">🚀</span>
            <span className="text-slate-400 text-sm">
              {overallProgress === 100
                ? "مبروك! خلصت كل المهام! 🎉🏆"
                : overallProgress >= 75
                  ? "أنت قربت تخلص! كمّل 💪"
                  : overallProgress >= 50
                    ? "نص الطريق! شغل جميل 👏"
                    : overallProgress >= 25
                      ? "بداية كويسة، كمّل! 🔥"
                      : "يلا نبدأ المذاكرة! 📚"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
