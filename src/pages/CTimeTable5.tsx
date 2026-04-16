import {IonButton,IonButtons,IonContent,IonHeader,IonInput,IonItem,IonList,IonMenuButton,IonPage,IonSpinner,IonTitle,IonToolbar,IonLabel} from"@ionic/react";

import { useState} from 'react';


import '@ionic/react/css/ionic-swiper.css';

interface LectureDay {
  date: string;
  officially_cancelled: string[];
  until_further_notice: string[];
}

const CancelledLectures: React.FC = () => {
  const [lectures, setLectures] = useState<LectureDay[]>([]);
  const [loading, setLoading] = useState(false);
  const link = "https://pseudoregally-nonpreservative-tammera.ngrok-free.dev/scrape"
  const [showInput, setShowInput] = useState(false);


const fetchCancelledLectures = async () => {
    setShowInput(false);

  try {
    setLoading(true);

    const response = await fetch(link, {
      method: "get",
      headers: new Headers({
        "ngrok-skip-browser-warning": "69420",
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    localStorage.setItem("Clessons", JSON.stringify(data.data));
    setLectures(data.data);
  } catch (error) {
    console.error("Fetch failed:", error);

    const cached = localStorage.getItem("Clessons");
    if (cached) {
      console.log("Loaded cached lectures from localStorage");
      setLectures(JSON.parse(cached));
    } else {
      console.warn("No cached data found in localStorage");
    }
  } finally {
    setLoading(false);
  }
};

{/** https://pseudoregally-nonpreservative-tammera.ngrok-free.dev/scrape */}
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start">
            <IonMenuButton color="dark" />
          </IonButtons>
          <IonTitle>Cancelled Lessons</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Refresh button & optional input */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            marginBottom: "12px",
            gap: "10px",
          }}
        >
          <IonButton
            size="small"
            onClick={fetchCancelledLectures}
          >
            Refresh
          </IonButton>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <IonSpinner name="crescent" />
            <p>Fetching cancelled lectures...</p>
          </div>
        )}

        {/* Lecture list */}
        {!loading && lectures.length > 0 && (
          <IonList>
            {lectures.map((day, index) => (
              <IonItem key={index} lines="full" color="light">
                <IonLabel>
                  <h2 style={{ fontWeight: "bold", marginBottom: "8px" }}>
                    {day.date}
                  </h2>

                  {day.officially_cancelled.length > 0 && (
                    <>
                      <h3 style={{ marginBottom: "4px", fontWeight: "bold" }}>
                        Officially Cancelled
                      </h3>
                      <ul style={{ margin: 0, paddingLeft: "18px" }}>
                        {day.officially_cancelled.map((lec, i) => (
                          <li key={i}>{lec}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {day.until_further_notice.length > 0 && (
                    <>
                      <h3 style={{ marginBottom: "4px", fontWeight: "bold" }}>
                        Until Further Notice
                      </h3>
                      <ul style={{ margin: 0, paddingLeft: "18px" }}>
                        {day.until_further_notice.map((lec, i) => (
                          <li key={i}>{lec}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        {!loading && lectures.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "20px", opacity: 0.7 }}>
            No cancelled lectures found. Try refreshing.
          </p>
        )}
      </IonContent>
    </IonPage>
  );
};


export default CancelledLectures;

