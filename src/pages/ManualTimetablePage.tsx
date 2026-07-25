// src/pages/ManualTimetablePage.tsx

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
  createAnimation,
  useIonToast,
} from "@ionic/react";

import {
  addOutline,
  cardOutline,
  caretDown,
  caretUpSharp,
  close,
  repeatSharp,
  trash,
} from "ionicons/icons";

import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import useSound from "use-sound";
import Pipe from "/assets/metal1.mp3";

import {
  getTimetableStorageKeys,
} from "../config/manualTimetables";

//@ts-ignore
import "swiper/css";
//@ts-ignore
import "swiper/css/pagination";
import "@ionic/react/css/ionic-swiper.css";

type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

interface Lesson {
  starttime: string;
  endtime: string;
  text: string;
}

type LessonMap = Record<Day, Lesson[]>;

interface ManualTimetablePageProps {
  pageId: number;
  defaultTitle: string;
  onTitleChange?: (pageId: number, title: string) => void;
}

const DAYS: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, index) => {
  const hour = 8 + Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";

  return `${hour}:${minute}`;
});

function createEmptyLessons(): LessonMap {
  return {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  };
}

function loadLessons(storageKey: string): LessonMap {
  try {
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return createEmptyLessons();
    }

    const parsed = JSON.parse(stored);

    return {
      ...createEmptyLessons(),
      ...parsed,
    };
  } catch (error) {
    console.error("Could not load timetable lessons:", error);
    return createEmptyLessons();
  }
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

const makeSlideAnimation =
  (direction: "up" | "down") => (baseElement: HTMLElement) => {
    const root = baseElement.shadowRoot;
    const backdrop = root?.querySelector("ion-backdrop");
    const wrapper = root?.querySelector(".modal-wrapper");

    if (!backdrop || !wrapper) {
      return createAnimation().addElement(baseElement);
    }

    const [from, to] =
      direction === "up"
        ? ["translateY(100%)", "translateY(0)"]
        : ["translateY(0)", "translateY(100%)"];

    return createAnimation()
      .addElement(baseElement)
      .duration(300)
      .easing("ease-out")
      .addAnimation([
        createAnimation()
          .addElement(backdrop)
          .fromTo("opacity", "0.01", "var(--backdrop-opacity)"),

        createAnimation()
          .addElement(wrapper)
          .fromTo("transform", from, to),
      ]);
  };

interface DaySlideProps {
  day: Day;
  lessons: Lesson[];
  startTime: string;
  endTime: string;
  lessonText: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onLessonTextChange: (value: string) => void;
  onAdd: () => void;
  onHoldStart: (index: number) => void;
  onHoldEnd: () => void;
}

const DaySlide: React.FC<DaySlideProps> = ({
  day,
  lessons,
  startTime,
  endTime,
  lessonText,
  onStartTimeChange,
  onEndTimeChange,
  onLessonTextChange,
  onAdd,
  onHoldStart,
  onHoldEnd,
}) => {
  return (
    <div
      style={{
        height: "100%",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        color: "#fff",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          margin: "0 0 20px",
        }}
      >
        {day}
      </h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <IonSelect
          interface="popover"
          toggleIcon={caretUpSharp}
          expandedIcon={caretDown}
          placeholder="Start"
          value={startTime}
          onIonChange={(event) =>
            onStartTimeChange(event.detail.value ?? "")
          }
        >
          {TIME_OPTIONS.map((time) => (
            <IonSelectOption key={time} value={time}>
              {time}
            </IonSelectOption>
          ))}
        </IonSelect>

        <IonSelect
          interface="popover"
          toggleIcon={caretUpSharp}
          expandedIcon={caretDown}
          placeholder="End"
          value={endTime}
          onIonChange={(event) =>
            onEndTimeChange(event.detail.value ?? "")
          }
        >
          {TIME_OPTIONS.map((time) => (
            <IonSelectOption key={time} value={time}>
              {time}
            </IonSelectOption>
          ))}
        </IonSelect>

        <IonInput
          label="Lesson Info"
          labelPlacement="floating"
          value={lessonText}
          onIonInput={(event) =>
            onLessonTextChange(event.detail.value ?? "")
          }
          style={{ flex: 1, textAlign: "left" }}
        />

        <IonButton shape="round" onClick={onAdd}>
          <IonIcon slot="icon-only" icon={addOutline} />
        </IonButton>
      </div>

      <div style={{ flex: 1, width: "100%", overflowY: "auto" }}>
        {lessons.map((lesson, index) => (
          <IonItem
            key={`${lesson.starttime}-${lesson.endtime}-${index}`}
            color="light"
            lines="none"
            style={{ userSelect: "none" }}
            onPointerDown={() => onHoldStart(index)}
            onPointerUp={onHoldEnd}
            onPointerLeave={onHoldEnd}
            onPointerCancel={onHoldEnd}
          >
            <IonLabel>
              <h2>
                {lesson.starttime} – {lesson.endtime}: {lesson.text}
              </h2>
            </IonLabel>
          </IonItem>
        ))}
      </div>
    </div>
  );
};

const ManualTimetablePage: React.FC<ManualTimetablePageProps> = ({
  pageId,
  defaultTitle,
  onTitleChange,
}) => {
  const storageKeys = useMemo(
    () => getTimetableStorageKeys(pageId),
    [pageId],
  );

  const [lessons, setLessons] = useState<LessonMap>(() =>
    loadLessons(storageKeys.lessons),
  );

  const [title, setTitle] = useState(
    () => localStorage.getItem(storageKeys.title) || defaultTitle,
  );

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [lessonText, setLessonText] = useState("");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    () => localStorage.getItem(storageKeys.image),
  );
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [presentToast] = useIonToast();
  const [playSound] = useSound(Pipe, {
  volume: 200,
});

  useEffect(() => {
    localStorage.setItem(storageKeys.lessons, JSON.stringify(lessons));
  }, [lessons, storageKeys.lessons]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
      }
    };
  }, []);

  const saveTitle = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      presentToast({
        message: "Title cannot be empty",
        duration: 1200,
        color: "warning",
        position: "top",
      });

      const previousTitle =
        localStorage.getItem(storageKeys.title) || defaultTitle;

      setTitle(previousTitle);
      setIsEditingTitle(false);
      return;
    }

    setTitle(trimmedTitle);
    localStorage.setItem(storageKeys.title, trimmedTitle);
    onTitleChange?.(pageId, trimmedTitle);
    setIsEditingTitle(false);
  };

  const addLesson = (day: Day) => {
    if (!startTime || !endTime || !lessonText.trim()) {
      presentToast({
        message: "Complete all lesson fields",
        duration: 1200,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (toMinutes(endTime) <= toMinutes(startTime)) {
      presentToast({
        message: "End time must be after start time",
        duration: 1200,
        color: "warning",
        position: "top",
      });
      return;
    }

    const newLesson: Lesson = {
      starttime: startTime,
      endtime: endTime,
      text: lessonText.trim(),
    };

    setLessons((currentLessons) => ({
      ...currentLessons,
      [day]: [...currentLessons[day], newLesson].sort(
        (first, second) =>
          toMinutes(first.starttime) - toMinutes(second.starttime),
      ),
    }));

    setStartTime("");
    setEndTime("");
    setLessonText("");
  };

  const deleteLesson = (day: Day, index: number) => {
    setLessons((currentLessons) => ({
      ...currentLessons,
      [day]: currentLessons[day].filter(
        (_, lessonIndex) => lessonIndex !== index,
      ),
    }));

    presentToast({
      message: "Lesson removed",
      duration: 1500,
      position: "top",
      color: "danger",
      icon: trash,
    });
  };

  const startDeleteHold = (day: Day, index: number) => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
    }

    holdTimer.current = setTimeout(() => {
      deleteLesson(day, index);
      holdTimer.current = null;
    }, 1000);
  };

  const cancelDeleteHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      setSelectedImage(reader.result);
      localStorage.setItem(storageKeys.image, reader.result);
    };

    reader.readAsDataURL(file);

    // Allows choosing the same file again.
    event.target.value = "";
  };
  const handleImageButtonClick = () => {

  if (selectedImage) {
    setIsImageModalOpen(true);
  } else {
    imageInputRef.current?.click();
  }
};

  const refreshFromStorage = () => {
    setLessons(loadLessons(storageKeys.lessons));
    setTitle(
      localStorage.getItem(storageKeys.title) || defaultTitle,
    );
    setSelectedImage(localStorage.getItem(storageKeys.image));
  };

  const currentDay = new Date().getDay();
  const initialSlide =
    currentDay >= 1 && currentDay <= 5 ? currentDay - 1 : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start">
            <IonMenuButton color="dark" />
          </IonButtons>

          {isEditingTitle ? (
            <IonInput
              value={title}
              onIonInput={(event) =>
                setTitle(event.detail.value ?? "")
              }
              onBlur={saveTitle}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  saveTitle();
                }
              }}
              placeholder="Enter a title"
              style={{
                fontWeight: "bold",
                textAlign: "left",
                flex: 1,
                "--background": "transparent",
                "--padding-start": "48px",
              }}
            />
          ) : (
            <IonTitle
              onClick={() => setIsEditingTitle(true)}
              style={{
                textAlign: "left",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </IonTitle>
          )}

          <IonButtons slot="end">
            <IonButton
              color="dark"
              onClick={handleImageButtonClick}
            >
              <IonIcon icon={cardOutline} style={{ fontSize: 28 }} />
            </IonButton>
          </IonButtons>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">
        <IonRefresher
          slot="fixed"
          mode="md"
          onIonRefresh={(event) => {
            refreshFromStorage();
            event.detail.complete();
          }}
        >
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
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
                onLessonTextChange={setLessonText}
                onAdd={() => addLesson(day)}
                onHoldStart={(index) =>
                  startDeleteHold(day, index)
                }
                onHoldEnd={cancelDeleteHold}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <IonModal
          className="force-solid-modal"
          isOpen={isImageModalOpen}
          onDidDismiss={() => setIsImageModalOpen(false)}
          enterAnimation={makeSlideAnimation("up")}
          leaveAnimation={makeSlideAnimation("down")}
          backdropDismiss={false}
        >
          <IonHeader>
            <IonToolbar color="light">
              <IonTitle>Card</IonTitle>

              <IonButtons slot="start">
<IonButton
  fill="clear"
  onClick={() => {
    playSound();
    imageInputRef.current?.click();
  }}
>
  <IonIcon icon={repeatSharp} />
</IonButton>
              </IonButtons>

              <IonButtons slot="end">
                <IonButton
                  onClick={() => setIsImageModalOpen(false)}
                >
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent
            fullscreen
            className="ion-no-padding"
            style={{
              position: "relative",
              height: "100%",
              background: "#fff",
            }}
          >
            <IonButton
              fill="clear"
              aria-label="Close image"
              onClick={() => setIsImageModalOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 5,
              }}
            />

            {selectedImage ? (
              <IonImg
                src={selectedImage}
                alt="Uploaded timetable card"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  width: "100%",
                  maxHeight: "78vh",
                  margin: "0 auto",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  borderRadius: 12,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
                }}
              />
            ) : (
              <IonText>No image uploaded.</IonText>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ManualTimetablePage;