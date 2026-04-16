import {IonHeader,IonIcon,IonImg,IonInput,IonItem,IonMenuButton,IonModal,IonPage,IonRefresher,IonRefresherContent,IonText,IonTitle,IonToolbar,
  useIonToast,createAnimation,IonButton,IonButtons,IonSelectOption,IonSelect,IonLabel,IonContent} from"@ionic/react";

import { useState,useEffect,useRef } from 'react';

import {cardOutline,cloudUploadOutline,addOutline,caretDown,caretUpSharp,trash,close,repeatSharp} from"ionicons/icons"; 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import useSound from 'use-sound';
import Pipe from '/assets/metal1.mp3';

import '@ionic/react/css/ionic-swiper.css';



const TimeTable4: React.FC = () => {
// --- 🧠 STATE VARIABLES ---
const [lessons4, setLessons4] = useState<Record<string, { starttime: string; endtime: string; text: string }[]>>(() => {
  const savedLessons4 = localStorage.getItem("timetableLessons4");
  if (savedLessons4) {
    try {
      return JSON.parse(savedLessons4);
    } catch (err) {
      console.error("Error parsing saved lessons:", err);
    }
  }
  return {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  };
});
const [startTime4, setStartTime4] = useState("");
const [endTime4, setEndTime4] = useState("");
const [lessonText, setLessonText] = useState("");
const [holdTimeout, setHoldTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
const [isEditing4, setIsEditing4] = useState(false);
const [selectedImage4, setSelectedImage4] = useState<string | null>(null);
const [isImageModalOpen, setIsImageModalOpen] = useState(false);
const [PlaySound] = useSound(Pipe);
const [title4, setTitle4] = useState(localStorage.getItem("timetableTitle4") || "Title is editable");


// --- 🎛️ REFS & MEDIA ---
const imageInputRef = useRef<HTMLInputElement>(null);
const pdfInputRef4 = useRef<HTMLInputElement>(null);

// --- 🔔 TOAST SETUP ---
const [present] = useIonToast();



// --- 💾 LOCAL STORAGE EFFECTS ---
useEffect(() => {localStorage.setItem("timetableLessons4", JSON.stringify(lessons4));}, [lessons4]);
useEffect(() => localStorage.setItem("timetableTitle4", title4), [title4]);

useEffect(() => {
  const savedImg4 = localStorage.getItem("timetableImage4");
  if (savedImg4) setSelectedImage4(savedImg4);
}, []);

useEffect(() => {
  const savedLessons4 = localStorage.getItem("timetableLessons4");
  if (savedLessons4) setLessons4(JSON.parse(savedLessons4));
}, []);

// --- 🕒 TIME OPTIONS ---
const timeOptions4 = Array.from({ length: 12 * 2 }, (_, i) => {
  const hour4 = 8 + Math.floor(i / 2);
  const minute4 = i % 2 === 0 ?"00" :"30";
  return `${hour4}:${minute4}`;
});

// --- 📅 LESSON FUNCTIONS ---
const addLesson = (day: string) => {
  if (!startTime4 || !endTime4 || !lessonText) return;

  const newLesson = { starttime: startTime4, endtime: endTime4, text: lessonText };

  setLessons4((prev) => ({
    ...prev,
    [day]: [...prev[day], newLesson],
  }));

  setStartTime4("");
  setEndTime4("");
  setLessonText("");
};

const deleteLesson = (day: string, index: number) => {
  present({message:"Lesson Removed",duration: 1500,position: "top",color:"danger",icon: trash});
  setLessons4((prev) => ({
    ...prev,
    [day]: prev[day].filter((_, i) => i !== index),
  }));
};

// --- ✋ HOLD GESTURE HANDLERS ---
const handleHoldStart = (day: string, index: number) => {
  const timeout = setTimeout(() => {
    deleteLesson(day, index);
  }, 1000); // 1.5s hold
  setHoldTimeout(timeout);
};

const handleHoldEnd = () => {
  if (holdTimeout) {
    clearTimeout(holdTimeout);
    setHoldTimeout(null);
  }
};

// --- 🖼️ IMAGE HANDLERS ---
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    setSelectedImage4(base64);
    localStorage.setItem("timetableImage4", base64);
  };
  reader.readAsDataURL(file);
};

const handleImageButtonClick = () =>
  selectedImage4 ? setIsImageModalOpen(true) : imageInputRef.current?.click();

const handlePdfButtonClick = () => {
  PlaySound();
  pdfInputRef4.current?.click();
};
//Modal Sliding Animation
const slideUpAnimation = (baseEl: HTMLElement) => {
  const root = baseEl.shadowRoot!;
  const backdrop = root.querySelector("ion-backdrop")!;
  const wrapper = root.querySelector(".modal-wrapper")!;

  const backdropAnimation = createAnimation()
    .addElement(backdrop)
    .fromTo("opacity","0.01","var(--backdrop-opacity)");

  const wrapperAnimation = createAnimation()
    .addElement(wrapper)
    .keyframes([
      { offset: 0, transform:"translateY(100%)" },
      { offset: 1, transform:"translateY(0)" },
    ]);

  return createAnimation()
    .addElement(baseEl)
    .easing("ease-out")
    .duration(300)
    .addAnimation([backdropAnimation, wrapperAnimation]);
};

const slideDownAnimation = (baseEl: HTMLElement) =>
  slideUpAnimation(baseEl).direction("reverse");
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start">
            <IonMenuButton color="dark" />
          </IonButtons>

          {isEditing4 ? (
  <IonInput
    value={title4}
    onIonInput={(e) => setTitle4(e.detail.value ?? '')}
    onBlur={() => {
      const newTitle4 = title4.trim();
      if (!newTitle4) {
        present({message: 'Title cannot be empty',duration: 300,color: 'warning',position: 'top'});
        const savedTitle4 = localStorage.getItem('timetableTitle4') || 'Page 4';
        setTitle4(savedTitle4);
      } else {
        setTitle4(newTitle4);
      }
      setIsEditing4(false);
    }}
    placeholder="Enter a title"
    style={{
      fontWeight: 'bold',
      textAlign: 'left',
      flex: 1,
      '--background': 'transparent',
      '--padding-start': '48px',
    }}
  />
) : (
  <IonTitle
    style={{
      textAlign: 'left',
      fontWeight: 'bold',
      flex: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}
    onClick={() => setIsEditing4(true)}
  >
    {title4 || 'Page 4'}
  </IonTitle>
)}


          {/* Upload Buttons */}
          <IonButtons slot="end">
            <IonButton color="dark" onClick={handleImageButtonClick}>
              <IonIcon icon={cardOutline} style={{fontSize:"28px"}}/>
            </IonButton>
            <IonButton color="dark" onClick={handlePdfButtonClick}>
              <IonIcon icon={cloudUploadOutline} style={{fontSize:"28px"}}/>
            </IonButton>
          </IonButtons>

          {/* Hidden Inputs */}
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            ref={imageInputRef}
            style={{ display:"none" }}
            onChange={handleFileChange}
          />
          <input
            type="file"
            accept=".pdf"
            ref={pdfInputRef4}
            style={{ display:"none" }}
          />
        </IonToolbar>
      </IonHeader>

<IonContent color="light">
            {/* Pull to refresh */}
<IonRefresher
  slot="fixed"
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
  <Swiper
    modules={[Pagination]}
    pagination={{ clickable: true }}
    spaceBetween={30}
    style={{ height:"100%" }}
    initialSlide={(() => {
      const day = new Date().getDay();
      if (day === 0 || day === 6 ) return 0;
      return day - 1;
    })()}
  >
 <SwiperSlide>
      <div
        style={{
          position:"relative",
          height:"100%",
        }}
      >
        {/* Title */}
        <h1
          style={{
            position:"absolute",
            top:"20px",
            transform:"translateX(90%)",
            fontSize:"2rem",
            fontWeight:"bold",
            color:"#ffffffff",
            margin: 0,
          }}
        >
          Monday
        </h1>
      </div>
      

<div style={{ 
              position:"relative", 
              height:"80%", width:"100%", 
              padding:"20px", 
              color:"#ffffffff", 
              display:"flex", 
              flexDirection:"column", 
              alignItems:"flex-start",
   }} >
        {/* Input Row */}
<div style={{ 
              display:"flex", 
              alignItems:"center", 
              gap:"12px", marginTop:"20px", 
              marginBottom:"20px", 
              flexWrap:"nowrap",
   }} >
          {/* Start Time Picker */}
          <div
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:"4px",
            }}
          >
            <IonSelect
              interface="popover"
              className="always-flip"
              toggleIcon={caretUpSharp}
              expandedIcon={caretDown}
              placeholder="Start"
              value={startTime4}
              onIonChange={(e) => setStartTime4(e.detail.value!)}
              style={{ minWidth:"40px",marginTop:"10px" }}

            >
              {timeOptions4.map((t) => (
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* End Time Picker */}
          <div
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:"4px",
            }}
          >
            <IonSelect
              interface="popover"
              className="always-flip"
              toggleIcon={caretUpSharp}
              expandedIcon={caretDown}
              placeholder="End"
              value={endTime4}
              onIonChange={(e) => setEndTime4(e.detail.value!)}
              style={{ minWidth:"40px",marginTop:"10px" }}
            >
              {timeOptions4.map((t) => (
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* Lesson Input */}
<IonInput
  label="Lesson Info"
  labelPlacement="floating"
  value={lessonText}
  onIonInput={(e) => setLessonText(e.detail.value ??"")}
  style={{
    width:"80%",
    textAlign:"left",        // ensures typing starts from left
  }}
  className="lesson-input"
/>

          {/* Add Button */}
          <IonButton onClick={() => addLesson("Monday")} className="button-round">
            <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
          </IonButton>
        </div>

        {/* Lesson List */}
<div style={{ marginTop:"20px", width:"100%" }}>
  {lessons4["Monday"].map((lesson, index) => (
    <IonItem
      key={index}
      color="light"
      lines="none"
      onTouchStart={() => handleHoldStart("Monday",index)}
      onTouchEnd={handleHoldEnd}
      style={{ userSelect:"none" }}
    >
      <IonLabel>
        <h2>
          {lesson.starttime} - {lesson.endtime}: {lesson.text}
        </h2>
      </IonLabel>
    </IonItem>
  ))}

</div>
    </div>
    </SwiperSlide>

 <SwiperSlide>
      <div
        style={{
          position:"relative",
          height:"100%",
        }}
      >
        {/* Title */}
        <h1
          style={{
            position:"absolute",
            top:"40px",
            transform:"translateX(90%)",
            fontSize:"2rem",
            fontWeight:"bold",
            color:"#ffffffff",
            margin: 0,
          }}
        >
          Tuesday
        </h1>
      </div>

      <div
        style={{
          position:"relative",
          height:"80%",
          width:"100%",
          padding:"20px",
          color:"#ffffffff",
          display:"flex",
          flexDirection:"column",
          alignItems:"flex-start",
        }}
      >
        {/* Input Row */}
        <div
          style={{
            display:"flex",
            alignItems:"center",
            gap:"12px",
            marginTop:"20px",
            flexWrap:"nowrap",
          }}
        >
          {/* Start Time Picker */}
          <div
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:"4px",
            }}
          >
            <IonSelect
              interface="popover"
              className="always-flip"
              toggleIcon={caretUpSharp}
              expandedIcon={caretDown}
              placeholder="Start"
              value={startTime4}
              onIonChange={(e) => setStartTime4(e.detail.value!)}
              style={{ minWidth:"40px",marginTop:"10px" }}

            >
              {timeOptions4.map((t) => (
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* End Time Picker */}
          <div
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:"4px",
            }}
          >
            <IonSelect
              interface="popover"
              className="always-flip"
              toggleIcon={caretUpSharp}
              expandedIcon={caretDown}
              placeholder="End"
              value={endTime4}
              onIonChange={(e) => setEndTime4(e.detail.value!)}
              style={{ minWidth:"40px",marginTop:"10px" }}
            >
              {timeOptions4.map((t) => (
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* Lesson Input */}
          <IonInput
            label="Lesson Info"
            labelPlacement="floating"
            value={lessonText}
            onIonInput={(e) => setLessonText(e.detail.value ??"")}
            className="lesson-input"
            style={{
              width:"80%",
              textAlign:"left",        // ensures typing starts from left
            }}/>
          {/* Add Button */}
          <IonButton onClick={() => addLesson("Tuesday")}  className="button-round">
            <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
          </IonButton>
        </div>

        {/* Lesson List */}
        <div style={{ marginTop:"20px", width:"100%" }}>
          {lessons4["Tuesday"].map((lesson, index) => (
    <IonItem
      key={index}
      color="light"
      lines="none"
      onTouchStart={() => handleHoldStart("Tuesday",index)}
      onTouchEnd={handleHoldEnd}
      style={{ userSelect:"none" }}
    >
              <IonLabel>
                <h2>
                  {lesson.starttime} - {lesson.endtime}: {lesson.text}
                </h2>
                <h2></h2>
              </IonLabel>
            </IonItem>
          ))}
        </div>
      </div>
    </SwiperSlide>

 <SwiperSlide>
      <div
        style={{
          position:"relative",
          height:"100%",
        }}
      >
        {/* Title */}
        <h1
          style={{
            position:"absolute",
            top:"40px",
            transform:"translateX(53%)",
            fontSize:"2rem",
            fontWeight:"bold",
            color:"#ffffffff",
            margin: 0,
          }}
        >
          Wednesday
        </h1>
      </div>

      <div
        style={{
          position:"relative",
          height:"80%",
          width:"100%",
          padding:"20px",
          color:"#ffffffff",
          display:"flex",
          flexDirection:"column",
          alignItems:"flex-start",
        }}
      >
        {/* Input Row */}
        <div
          style={{
            display:"flex",
            alignItems:"center",
            gap:"12px",
            marginTop:"20px",
            flexWrap:"nowrap",
          }}
        >
          {/* Start Time Picker */}
          <div
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:"4px",
            }}
          >
            <IonSelect
              interface="popover"
              className="always-flip"
              toggleIcon={caretUpSharp}
              expandedIcon={caretDown}
              placeholder="Start"
              value={startTime4}
              onIonChange={(e) => setStartTime4(e.detail.value!)}
              style={{ minWidth:"40px",marginTop:"10px" }}

            >
              {timeOptions4.map((t) => (
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* End Time Picker */}
          <div
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:"4px",
            }}
          >
            <IonSelect
              interface="popover"
              className="always-flip"
              toggleIcon={caretUpSharp}
              expandedIcon={caretDown}
              placeholder="End"
              value={endTime4}
              onIonChange={(e) => setEndTime4(e.detail.value!)}
              style={{ minWidth:"40px",marginTop:"10px" }}
            >
              {timeOptions4.map((t) => (
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* Lesson Input */}
          <IonInput
            label="Lesson Info"
            labelPlacement="floating"
            value={lessonText}
            onIonInput={(e) => setLessonText(e.detail.value ??"")}
            className="lesson-input"
            style={{
              width:"80%",
              textAlign:"left",        // ensures typing starts from left
            }}/>

          {/* Add Button */}
          <IonButton onClick={() => addLesson("Wednesday")} className="button-round">
            <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
          </IonButton>
        </div>

        {/* Lesson List */}
        <div style={{ marginTop:"20px", width:"100%" }}>
          {lessons4["Wednesday"].map((lesson, index) => (
    <IonItem
      key={index}
      color="light"
      lines="none"
      onTouchStart={() => handleHoldStart("Wednesday",index)}
      onTouchEnd={handleHoldEnd}
      style={{ userSelect:"none" }}
    >
              <IonLabel>
                <h2>
                  {lesson.starttime} - {lesson.endtime}: {lesson.text}
                </h2>
                <h2></h2>
              </IonLabel>
            </IonItem>
          ))}
        </div>
      </div>
    </SwiperSlide>
 <SwiperSlide>
      <div
        style={{
          position:"relative",
          height:"100%",
        }}
      >
        {/* Title */}
        <h1
          style={{
            position:"absolute",
            top:"40px",
            transform:"translateX(90%)",
            fontSize:"2rem",
            fontWeight:"bold",
            color:"#ffffffff",
            margin: 0,
          }}
        >
          Thursday
        </h1>
      </div>

      <div
        style={{
          position:"relative",
          height:"80%",
          width:"100%",
          padding:"20px",
          color:"#ffffffff",
          display:"flex",
          flexDirection:"column",
          alignItems:"flex-start",
        }}
      >
        {/* Input Row */}
        <div
          style={{
            display:"flex",
            alignItems:"center",
            gap:"12px",
            marginTop:"20px",
            flexWrap:"nowrap",
          }}
        >
          {/* Start Time Picker */}
          <div
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:"4px",
            }}
          >
            <IonSelect
              interface="popover"
              className="always-flip"
              toggleIcon={caretUpSharp}
              expandedIcon={caretDown}
              placeholder="Start"
              value={startTime4}
              onIonChange={(e) => setStartTime4(e.detail.value!)}
              style={{ minWidth:"40px",marginTop:"10px" }}

            >
              {timeOptions4.map((t) => (
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* End Time Picker */}
          <div
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:"4px",
            }}
          >
            <IonSelect
              interface="popover"
              className="always-flip"
              toggleIcon={caretUpSharp}
              expandedIcon={caretDown}
              placeholder="End"
              value={endTime4}
              onIonChange={(e) => setEndTime4(e.detail.value!)}
              style={{ minWidth:"40px",marginTop:"10px" }}
            >
              {timeOptions4.map((t) => (
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* Lesson Input */}
          <IonInput
            label="Lesson Info"
            labelPlacement="floating"
            value={lessonText}
            onIonInput={(e) => setLessonText(e.detail.value ??"")}
            className="lesson-input"
            style={{
              width:"80%",
              textAlign:"left",        // ensures typing starts from left
            }}/>

          {/* Add Button */}
          <IonButton onClick={() => addLesson("Thursday")} className="button-round">
            <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
          </IonButton>
        </div>

        {/* Lesson List */}
        <div style={{ marginTop:"20px", width:"100%" }}>
          {lessons4["Thursday"].map((lesson, index) => (
    <IonItem
      key={index}
      color="light"
      lines="none"
      onTouchStart={() => handleHoldStart("Thursday",index)}
      onTouchEnd={handleHoldEnd}
      style={{ userSelect:"none" }}
    >
              <IonLabel>
                <h2>
                  {lesson.starttime} - {lesson.endtime}: {lesson.text}
                </h2>
                <h2></h2>
              </IonLabel>
            </IonItem>
          ))}
        </div>
      </div>
    </SwiperSlide>

 <SwiperSlide>
      <div
        style={{
          position:"relative",
          height:"100%",
        }}
      >
        {/* Title */}
        <h1
          style={{
            position:"absolute",
            top:"40px",
            transform:"translateX(140%)",
            fontSize:"2rem",
            fontWeight:"bold",
            color:"#ffffffff",
            margin: 0,
          }}
        >
          Friday
        </h1>
      </div>

      <div
        style={{
          position:"relative",
          height:"80%",
          width:"100%",
          padding:"20px",
          color:"#ffffffff",
          display:"flex",
          flexDirection:"column",
          alignItems:"flex-start",
        }}
      >
        {/* Input Row */}
        <div
          style={{
            display:"flex",
            alignItems:"center",
            gap:"12px",
            marginTop:"20px",
            flexWrap:"nowrap",
          }}
        >
          {/* Start Time Picker */}
          <div
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:"4px",
            }}
          >
            <IonSelect
              interface="popover"
              className="always-flip"
              toggleIcon={caretUpSharp}
              expandedIcon={caretDown}
              placeholder="Start"
              value={startTime4}
              onIonChange={(e) => setStartTime4(e.detail.value!)}
              style={{ minWidth:"40px",marginTop:"10px" }}

            >
              {timeOptions4.map((t) => (
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* End Time Picker */}
          <div
            style={{
              display:"flex",
              flexDirection:"column",
              alignItems:"flex-start",
              gap:"4px",
            }}
          >
            <IonSelect
              interface="popover"
              className="always-flip"
              toggleIcon={caretUpSharp}
              expandedIcon={caretDown}
              placeholder="End"
              value={endTime4}
              onIonChange={(e) => setEndTime4(e.detail.value!)}
              style={{ minWidth:"40px",marginTop:"10px" }}
            >
              {timeOptions4.map((t) => (
                <IonSelectOption key={t} value={t}>
                  {t}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* Lesson Input */}
          <IonInput
            label="Lesson Info"
            labelPlacement="floating"
            value={lessonText}
            onIonInput={(e) => setLessonText(e.detail.value ??"")}
            className="lesson-input"
            style={{
              width:"80%",
              textAlign:"left",        // ensures typing starts from left
            }}/>

          {/* Add Button */}
          <IonButton onClick={() => addLesson("Friday")} className="button-round">
            <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
          </IonButton>
        </div>

        {/* Lesson List */}
        <div style={{ marginTop:"20px", width:"100%" }}>
          {lessons4["Friday"].map((lesson, index) => (
    <IonItem
      key={index}
      color="light"
      lines="none"
      onTouchStart={() => handleHoldStart("Friday",index)}
      onTouchEnd={handleHoldEnd}
      style={{ userSelect:"none" }}
    >
              <IonLabel>
                <h2>
                  {lesson.starttime} - {lesson.endtime}: {lesson.text}
                </h2>
                <h2></h2>
              </IonLabel>
            </IonItem>
          ))}
        </div>
      </div>
    </SwiperSlide>

  </Swiper>



      {/* Image Modal */}

<IonModal
  className="force-solid-modal"
  isOpen={isImageModalOpen}
  onDidDismiss={() => setIsImageModalOpen(false)}
  enterAnimation={slideUpAnimation}
  leaveAnimation={slideDownAnimation}
  backdropDismiss={false}
>
  {/* HEADER (kept EXACTLY how you had it) */}
  <IonHeader translucent={false}>
    <IonToolbar color="light">
      <IonTitle>Card</IonTitle>

      {/* Change Image button (left side) */}
      <IonButtons slot="start">
        <IonButton
          fill="clear"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            imageInputRef.current?.click();
          }}
        >
          <IonIcon icon={repeatSharp} style={{ fontSize: "31px" }} />
        </IonButton>
      </IonButtons>

      {/* Close button (right side) */}
      <IonButtons slot="end">
        <IonButton onClick={() => setIsImageModalOpen(false)}>
          <IonIcon icon={close} style={{ fontSize: "31px" }} />
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>

  <IonContent
    fullscreen
    className="ion-no-padding"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffffff",   // FULL SOLID, NO transparency
      height: "100%",
      position: "relative",
    }}
  >
    {/* 🔥 FULL SCREEN TAP AREA TO CLOSE MODAL */}
    <IonButton
      fill="clear"
      onClick={() => setIsImageModalOpen(false)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,                 // sits under the image
        background: "transparent",
        pointerEvents: "auto",
      }}
    />

    {/* IMAGE (CENTERED ALWAYS) */}
    {selectedImage4 ? (
      <IonImg
        src={selectedImage4}
        alt="Uploaded"
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          margin: "0 auto",
          zIndex: 10,
          width: "100%",
          maxHeight: "78vh",
          borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
          filter: "brightness(1.2) contrast(1.05)",
          pointerEvents: "auto",   // Image is interactive
        }}
      />
    ) : (
      <IonText
        style={{
          zIndex: 10,
          color: "#000",
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        No image uploaded.
      </IonText>
    )}
  </IonContent>
</IonModal>
</IonContent>


    </IonPage>
  );
};

export default TimeTable4;
