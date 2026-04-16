import {
  IonAlert, IonContent, IonHeader, IonIcon, IonImg, IonMenuButton,
  IonModal, IonPage, IonRefresher, IonRefresherContent, IonText,
  IonTitle, IonToolbar, createAnimation, IonButton, IonButtons, IonSpinner,
} from "@ionic/react";

import { useState, useEffect, useRef } from "react";
import { cardOutline, close, repeatSharp, downloadOutline } from "ionicons/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "@ionic/react/css/ionic-swiper.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lesson {
  time: string;
  class: string;
  lesson: string;
}

type LessonsMap = Record<string, Lesson[]>;

// ─── Constants ────────────────────────────────────────────────────────────────

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const link = "https://pseudoregally-nonpreservative-tammera.ngrok-free.dev/lessons";
// https://pseudoregally-nonpreservative-tammera.ngrok-free.dev/lessons
// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanText(subject: string): string {
  if (!subject) return "";
  let s = subject;
  s = s.replace(/\([^)]*\)/g, "");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
function parseStartMinutes(timeStr: string): number {
  const start = timeStr.split("-")[0].trim();
  const [h, m] = start.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function extractRoom(text: string): string {
  if (!text) return "";
  // accounts for ICT-B05, ICT-042, B04, etc.
  const match = text.match(/\b[A-Z]{2,4}-[A-Z]?\d{2,3}\b/i);
  return match ? match[0].toUpperCase() : "";
}

// ─── Lesson Card ──────────────────────────────────────────────────────────────

function LessonCard({ lesson }: { lesson: Lesson }) {
  const [start, ...rest] = lesson.time.split("-");
  const end = rest.join("-");

  const rawRoom = lesson.class; // lesson.class holds item.room from backend
  const isMissing = !rawRoom || rawRoom === "Could_not_get_room_sry";
  const room = isMissing ? null : rawRoom; // could be "ICT-B05 or ICT-126"
//Could_not_get_room_sry
  return (
    <div style={cardStyle}>
      {/* Time row */}
      <div style={timeRowStyle}>
        <span style={timeTextStyle}>{start.trim()}</span>
        <span style={timeDashStyle}>–</span>
        <span style={timeTextStyle}>{end.trim()}</span>
      </div>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Subject */}
      <p style={subjectStyle}>{cleanText(lesson.lesson)}</p>

      {/* Room */}
        {room ? (
          <div style={roomRowStyle}>
            <span style={roomDotStyle} />
            <span style={roomTextStyle}>{room}</span> {/* shows "ICT-B05 or ICT-126" as-is */}
          </div>
        ) : null}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ITimeTable2: React.FC = () => {
  const [selectedImageI, setSelectedImageI] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [lessons, setLessons] = useState<LessonsMap>(() => {
    const blank: LessonsMap = {};
    weekdays.forEach((d) => (blank[d] = []));
    return blank;
  });

  const [askClassAlert, setAskClassAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLabel, setPageLabel] = useState("Image Timetable 2");

  // ── Persist image ──────────────────────────────────────────────────────────

  useEffect(() => {
    const savedImg = localStorage.getItem("ItimetableImage2");
    if (savedImg) setSelectedImageI(savedImg);

    const savedLessons = localStorage.getItem("ItimetableLessons2");
    const savedLabel = localStorage.getItem("IcachedPageLabel2");
    if (savedLessons) setLessons(JSON.parse(savedLessons));
    if (savedLabel) setPageLabel(savedLabel.replace(/^Page \d+\s*/, "").trim());
  }, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImageI(base64);
      localStorage.setItem("ItimetableImage2", base64);
    };
    reader.readAsDataURL(file);
  };

  const handleImageButtonClick = () =>
    selectedImageI ? setIsImageModalOpen(true) : imageInputRef.current?.click();

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchLessons = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await fetch(link, {
        headers: { "ngrok-skip-browser-warning": "69420" },
      });

      const json = await res.json();
      console.log("Backend response:", json);

      // Find the key that starts with "Page {pageNumber}"
      const pageKey = Object.keys(json).find((k) =>
        k.startsWith(`Page ${pageNumber}`)
      );

      if (!pageKey || !Array.isArray(json[pageKey])) {
        console.warn("Page not found:", pageNumber);
        return;
      }


      const map: LessonsMap = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };

      json[pageKey].forEach((item: any) => {
        const day = item.day;
        if (!map[day]) return;
          map[day].push({
            time: item.time?.replace("|", "").trim() || "",
            class: item.room ? item.room.toUpperCase() : "",  // ← fixes IcT-204 → ICT-204
            lesson: item.subject || "",
          });
      });

    for (const day of weekdays) {
      map[day].sort((a, b) => parseStartMinutes(a.time) - parseStartMinutes(b.time));
    }
      setLessons(map);
      localStorage.setItem("ItimetableLessons2", JSON.stringify(map));
      localStorage.setItem("IcachedPageLabel2", pageKey);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Animations ─────────────────────────────────────────────────────────────

  const slideUpAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot!;
    const backdrop = root.querySelector("ion-backdrop")!;
    const wrapper = root.querySelector(".modal-wrapper")!;
    return createAnimation()
      .addElement(baseEl)
      .easing("ease-out")
      .duration(300)
      .addAnimation([
        createAnimation().addElement(backdrop).fromTo("opacity", "0.01", "var(--backdrop-opacity)"),
        createAnimation().addElement(wrapper).keyframes([
          { offset: 0, transform: "translateY(100%)" },
          { offset: 1, transform: "translateY(0)" },
        ]),
      ]);
  };

  const slideDownAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot!;
    const backdrop = root.querySelector("ion-backdrop")!;
    const wrapper = root.querySelector(".modal-wrapper")!;
    return createAnimation()
      .addElement(baseEl)
      .easing("ease-out")
      .duration(300)
      .addAnimation([
        createAnimation().addElement(backdrop).fromTo("opacity", "0.01", "var(--backdrop-opacity)"),
        createAnimation().addElement(wrapper).keyframes([
          { offset: 0, transform: "translateY(0)" },
          { offset: 1, transform: "translateY(100%)" },
        ]),
      ]);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start">
            <IonMenuButton color="dark" />
          </IonButtons>

          <IonTitle style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.2px" }}>
            {pageLabel}
          </IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={handleImageButtonClick}>
              <IonIcon icon={cardOutline} style={{ fontSize: 28 }} />
            </IonButton>

            {/* This button opens the page number alert */}
            <IonButton onClick={() => setAskClassAlert(true)}>
              <IonIcon icon={downloadOutline} style={{ fontSize: 28 }} />
            </IonButton>
          </IonButtons>

          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            ref={imageInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </IonToolbar>
      </IonHeader>

      {/* ── Page number alert ───────────────────────────────────────────────── */}
      <IonAlert
        isOpen={askClassAlert}
        header="Enter Class Page Number"
        subHeader="The page number is 0 based ㅤㅤ Note that results may be inaaccurate"
        inputs={[{ name: "classname", type: "number" }]}
        buttons={[
          { text: "Cancel", role: "cancel" },
          {
            text: "Fetch",
            handler: (data) => {
              if (!data.classname) return false;
              fetchLessons(Number(data.classname) - 1);
            },
          },
        ]}
        onDidDismiss={() => setAskClassAlert(false)}
      />

      <IonContent color="light">
      <IonRefresher
        slot="fixed"
        mode="md"
        onIonRefresh={(e) => {
          // Small delay to let the refresh animation feel smooth
          setTimeout(() => {
            e.detail.complete();      // stop the refresher spinner
            window.location.reload(); // perform full app reload
          }, 500); // 0.5 second delay
        }}
      >
        <IonRefresherContent />
      </IonRefresher>

        {/* ── Swiper ──────────────────────────────────────────────────────── */}
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          style={{ height: "calc(100vh - 56px)", width: "100%" }}
        >
          {weekdays.map((day) => (
            <SwiperSlide key={day}>
              <div style={slideStyle}>

                {/* Day heading */}
                <div style={dayHeadingStyle}>
                  <h1 style={dayTitleStyle}>{day}</h1>
                  {!loading && (
                    <span style={lessonCountStyle}>
                      {lessons[day]?.length ?? 0} lesson{lessons[day]?.length !== 1 ? "s" : ""} {/* this line counts the lessons*/}
                    </span>
                  )}
                </div>


                {/* Lessons or states */}
                {loading ? (
                  <div style={centeredStyle}>
                    <IonSpinner name="crescent" style={{ color: "#2979FF" }} />
                    <p style={mutedTextStyle}>Loading lessons…</p>
                  </div>
                ) : (lessons[day]?.length ?? 0) === 0 ? (
                  <div style={centeredStyle}>
                    <p style={emptyEmojiStyle}>📓</p>
                    <p style={emptyTitleStyle}>No lessons</p>
                    <p style={mutedTextStyle}>Free day — enjoy it!</p>
                  </div>
                ) : (
                  <div style={listStyle}>
                    {lessons[day].map((l, i) => (
                      <LessonCard key={i} lesson={l} />
                    ))}
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ── Image modal (unchanged) ──────────────────────────────────────── */}
        <IonModal
          className="force-solid-modal"
          isOpen={isImageModalOpen}
          onDidDismiss={() => setIsImageModalOpen(false)}
          enterAnimation={slideUpAnimation}
          leaveAnimation={slideDownAnimation}
          backdropDismiss={false}
        >
          <IonHeader translucent={false}>
            <IonToolbar color="light">
              <IonTitle>Card</IonTitle>
              <IonButtons slot="start">
                <IonButton fill="clear" color="primary" onClick={(e) => { e.stopPropagation(); imageInputRef.current?.click(); }}>
                  <IonIcon icon={repeatSharp} style={{ fontSize: 31 }} />
                </IonButton>
              </IonButtons>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsImageModalOpen(false)}>
                  <IonIcon icon={close} style={{ fontSize: 31 }} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent fullscreen className="ion-no-padding" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", height: "100%", position: "relative" }}>
            <IonButton fill="clear" onClick={() => setIsImageModalOpen(false)} style={{ position: "absolute", inset: 0, zIndex: 5, background: "transparent", pointerEvents: "auto" }} />
            {selectedImageI ? (
              <IonImg
                src={selectedImageI}
                alt="Uploaded"
                style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%)", margin: "0 auto", zIndex: 10, width: "100%", maxHeight: "78vh", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.7)", filter: "brightness(1.2) contrast(1.05)", pointerEvents: "auto" }}
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

export default ITimeTable2;

// ─── Styles ───────────────────────────────────────────────────────────────────

const slideStyle: React.CSSProperties = {
  height: "100%",
  width:"100%",
  flexDirection: "column",
  padding: "28px 20px 80px",
  overflowY: "auto",
  boxSizing: "border-box",
};

const dayHeadingStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",   // count sits under title
  alignItems: "center",
  marginBottom: 6,
};

const dayTitleStyle: React.CSSProperties = {
  fontSize: "2rem",
  fontWeight: 800,
  margin: 0,
  color: "#fff",
  letterSpacing: "-0.8px",
};

const lessonCountStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#ffffff",
  letterSpacing: "0.2px",
  marginTop: 2,
};


const listStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const cardStyle: React.CSSProperties = {
  padding: "14px 1px",
};

const timeRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 3,
};

const timeTextStyle: React.CSSProperties = {
  fontSize: "0.94rem",
  fontWeight: 700,
  color: "#bfe6e5",
  letterSpacing: "0.3px",
};

const timeDashStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  color: "#bfe6e5",
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  marginBottom: 8,
};

const subjectStyle: React.CSSProperties = {
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: 3,
  fontSize: "0.98rem",
  fontWeight: 700,
  color: "#fff",
  lineHeight: 1.3,
  marginBottom: 6,
};

const roomRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
};

const roomDotStyle: React.CSSProperties = {
  width: 5,
  height: 5,
  borderRadius: "50%",
  background: "#ffffff",
  flexShrink: 0,
};

const roomTextStyle: React.CSSProperties = {
  fontSize: "0.96rem",
  color: "#bfe6e5",
  fontWeight: 500,
};

const centeredStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const emptyEmojiStyle: React.CSSProperties = {
  fontSize: "2rem",
  margin: 0,
  marginBottom: 4,
};

const emptyTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "1rem",
  color: "#fff",
  margin: 0,
};

const mutedTextStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "0.85rem",
  margin: 0,
};