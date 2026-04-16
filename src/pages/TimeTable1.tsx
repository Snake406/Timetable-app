import {
  IonHeader, IonIcon, IonImg, IonInput, IonItem, IonMenuButton, IonModal,
  IonPage, IonRefresher, IonRefresherContent, IonText, IonTitle, IonToolbar,
  useIonToast, createAnimation, IonButton, IonButtons, IonSelectOption,
  IonSelect, IonLabel, IonContent
} from "@ionic/react";
import { useState, useEffect, useRef } from "react";
import { cardOutline, cloudUploadOutline, addOutline, caretDown, caretUpSharp, trash, close, repeatSharp } from "ionicons/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import useSound from "use-sound";
import Pipe from "/assets/metal1.mp3";

import "swiper/css";
import "swiper/css/pagination";
import "@ionic/react/css/ionic-swiper.css";

// ─── Types ───────────────────────────────────────────────────────────────────

type Lesson = { starttime: string; endtime: string; text: string };
type LessonMap = Record<string, Lesson[]>;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

const TIME_OPTIONS = Array.from({ length: 12 * 2 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

const EMPTY_LESSONS: LessonMap = Object.fromEntries(DAYS.map((d) => [d, []]));

function loadLessons(): LessonMap {
  try {
    const saved = localStorage.getItem("timetableLessons");
    if (saved) return JSON.parse(saved);
  } catch {}
  return EMPTY_LESSONS;
}

// ─── Animations ──────────────────────────────────────────────────────────────

const makeSlideAnimation = (direction: "up" | "down") => (baseEl: HTMLElement) => {
  const root = baseEl.shadowRoot!;
  const backdrop = root.querySelector("ion-backdrop")!;
  const wrapper = root.querySelector(".modal-wrapper")!;
  const [from, to] = direction === "up"
    ? ["translateY(100%)", "translateY(0)"]
    : ["translateY(0)", "translateY(100%)"];

  return createAnimation()
    .addElement(baseEl)
    .easing("ease-out")
    .duration(300)
    .addAnimation([
      createAnimation().addElement(backdrop).fromTo("opacity", "0.01", "var(--backdrop-opacity)"),
      createAnimation().addElement(wrapper).keyframes([
        { offset: 0, transform: from },
        { offset: 1, transform: to },
      ]),
    ]);
};

// ─── Day Slide Component ──────────────────────────────────────────────────────

interface DaySlideProps {
  day: string;
  lessons: Lesson[];
  startTime: string;
  endTime: string;
  lessonText: string;
  onStartTime: (v: string) => void;
  onEndTime: (v: string) => void;
  onLessonText: (v: string) => void;
  onAdd: () => void;
  onHoldStart: (index: number) => void;
  onHoldEnd: () => void;
}

const DaySlide: React.FC<DaySlideProps> = ({
  day, lessons, startTime, endTime, lessonText,
  onStartTime, onEndTime, onLessonText, onAdd, onHoldStart, onHoldEnd,
}) => (
  <div style={{ height: "100%", padding: "20px", color: "#fff", display: "flex", flexDirection: "column" }}>
    <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: "0 0 20px" }}>{day}</h1>

    {/* Input Row */}
    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "nowrap", marginBottom: "20px" }}>
      {[
        { label: "Start", value: startTime, onChange: onStartTime },
        { label: "End",   value: endTime,   onChange: onEndTime   },
      ].map(({ label, value, onChange }) => (
        <IonSelect
          key={label}
          interface="popover"
          className="always-flip"
          toggleIcon={caretUpSharp}
          expandedIcon={caretDown}
          placeholder={label}
          value={value}
          onIonChange={(e) => onChange(e.detail.value!)}
          style={{ minWidth: "40px", marginTop: "10px" }}
        >
          {TIME_OPTIONS.map((t) => (
            <IonSelectOption key={t} value={t}>{t}</IonSelectOption>
          ))}
        </IonSelect>
      ))}

      <IonInput
        label="Lesson Info"
        labelPlacement="floating"
        value={lessonText}
        onIonInput={(e) => onLessonText(e.detail.value ?? "")}
        className="lesson-input"
        style={{ width: "80%", textAlign: "left" }}
      />

      <IonButton onClick={onAdd} shape="round" className="button-round">
        <IonIcon slot="icon-only" icon={addOutline} />
      </IonButton>
    </div>

    {/* Lesson List */}
    <div style={{ width: "100%", overflowY: "auto", flex: 1 }}>
      {lessons.map((lesson, index) => (
        <IonItem
          key={index}
          color="light"
          lines="none"
          onTouchStart={() => onHoldStart(index)}
          onTouchEnd={onHoldEnd}
          style={{ userSelect: "none" }}
        >
          <IonLabel>
            <h2>{lesson.starttime} - {lesson.endtime}: {lesson.text}</h2>
          </IonLabel>
        </IonItem>
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const TimeTable: React.FC = () => {
  const [lessons, setLessons] = useState<LessonMap>(loadLessons);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [lessonText, setLessonText] = useState("");
const [holdTimeout, setHoldTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [title, setTitle] = useState(localStorage.getItem("timetableTitle") || "Title is editable");


  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [present] = useIonToast();
  const [PlaySound] = useSound(Pipe);

  // ── Persistence ────────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("timetableLessons", JSON.stringify(lessons)); }, [lessons]);
  useEffect(() => { localStorage.setItem("timetableTitle", title); }, [title]);
  useEffect(() => {
    const img = localStorage.getItem("timetableImage");
    if (img) setSelectedImage(img);
  }, []);

  // ── Lesson Actions ─────────────────────────────────────────────────────────
  const addLesson = (day: string) => {
    if (!startTime || !endTime || !lessonText) return;
    setLessons((prev) => ({
      ...prev,
      [day]: [...prev[day], { starttime: startTime, endtime: endTime, text: lessonText }],
    }));
    setStartTime("");
    setEndTime("");
    setLessonText("");
  };

  const deleteLesson = (day: string, index: number) => {
    present({ message: "Lesson Removed", duration: 1500, position: "top", color: "danger", icon: trash });
    setLessons((prev) => ({ ...prev, [day]: prev[day].filter((_, i) => i !== index) }));
  };

  // ── Hold Gesture ───────────────────────────────────────────────────────────
  const handleHoldStart = (day: string, index: number) => {
    const t = setTimeout(() => deleteLesson(day, index), 1000);
    setHoldTimeout(t);
  };

  const handleHoldEnd = () => {
    if (holdTimeout) { clearTimeout(holdTimeout); setHoldTimeout(null); }
  };

  // ── Image Handlers ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      localStorage.setItem("timetableImage", base64);
    };
    reader.readAsDataURL(file);
  };

  const initialSlide = (() => {
    const day = new Date().getDay();
    return day === 0 || day === 6 ? 0 : day - 1;
  })();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start">
            <IonMenuButton color="dark" />
          </IonButtons>

          {isEditing ? (
            <IonInput
              value={title}
              onIonInput={(e) => setTitle(e.detail.value ?? "")}
              onBlur={() => {
                const trimmed = title.trim();
                if (!trimmed) {
                  present({ message: "Title cannot be empty", duration: 300, color: "warning", position: "top" });
                  setTitle(localStorage.getItem("timetableTitle") || "Page 1");
                } else {
                  setTitle(trimmed);
                }
                setIsEditing(false);
              }}
              placeholder="Enter a title"
              style={{ fontWeight: "bold", textAlign: "left", flex: 1, "--background": "transparent", "--padding-start": "48px" }}
            />
          ) : (
            <IonTitle
              onClick={() => setIsEditing(true)}
              style={{ textAlign: "left", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {title || "Page 1"}
            </IonTitle>
          )}

          <IonButtons slot="end">
            <IonButton color="dark" onClick={() => selectedImage ? setIsImageModalOpen(true) : imageInputRef.current?.click()}>
              <IonIcon icon={cardOutline} style={{ fontSize: "28px" }} />
            </IonButton>
            <IonButton color="dark" onClick={() => { PlaySound(); pdfInputRef.current?.click(); }}>
              <IonIcon icon={cloudUploadOutline} style={{ fontSize: "28px" }} />
            </IonButton>
          </IonButtons>

          <input type="file" accept="image/*" ref={imageInputRef} style={{ display: "none" }} onChange={handleFileChange} />
          <input type="file" accept=".pdf"    ref={pdfInputRef}   style={{ display: "none" }} />
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">
        <IonRefresher slot="fixed"mode="md" onIonRefresh={(e) => setTimeout(() => { e.detail.complete(); window.location.reload(); }, 500)}>
          <IonRefresherContent />
        </IonRefresher>

        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={30}
          initialSlide={initialSlide}
          style={{ height: "100%" }}
        >
          {DAYS.map((day) => (
            <SwiperSlide key={day}>
              <DaySlide
                day={day}
                lessons={lessons[day]}
                startTime={startTime}
                endTime={endTime}
                lessonText={lessonText}
                onStartTime={setStartTime}
                onEndTime={setEndTime}
                onLessonText={setLessonText}
                onAdd={() => addLesson(day)}
                onHoldStart={(i) => handleHoldStart(day, i)}
                onHoldEnd={handleHoldEnd}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Image Modal */}
        <IonModal
          className="force-solid-modal"
          isOpen={isImageModalOpen}
          onDidDismiss={() => setIsImageModalOpen(false)}
          enterAnimation={makeSlideAnimation("up")}
          leaveAnimation={makeSlideAnimation("down")}
          backdropDismiss={false}
        >
          <IonHeader translucent={false}>
            <IonToolbar color="light">
              <IonTitle>Card</IonTitle>
              <IonButtons slot="start">
                <IonButton fill="clear" color="primary" onClick={(e) => { e.stopPropagation(); imageInputRef.current?.click(); }}>
                  <IonIcon icon={repeatSharp} style={{ fontSize: "31px" }} />
                </IonButton>
              </IonButtons>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsImageModalOpen(false)}>
                  <IonIcon icon={close} style={{ fontSize: "31px" }} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent fullscreen className="ion-no-padding" style={{ background: "#fff", height: "100%", position: "relative" }}>
            <IonButton fill="clear" onClick={() => setIsImageModalOpen(false)}
              style={{ position: "absolute", inset: 0, zIndex: 5, background: "transparent" }}
            />
            {selectedImage ? (
              <IonImg
                src={selectedImage}
                alt="Uploaded"
                style={{
                  position: "absolute", top: "50%", left: 0, right: 0,
                  transform: "translateY(-50%)", margin: "0 auto", zIndex: 10,
                  width: "100%", maxHeight: "78vh", borderRadius: 12,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
                  filter: "brightness(1.2) contrast(1.05)",
                }}
              />
            ) : (
              <IonText style={{ zIndex: 10, color: "#000", fontSize: 18, fontWeight: 600 }}>
                No image uploaded.
              </IonText>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default TimeTable;