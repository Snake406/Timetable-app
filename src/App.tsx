import { Redirect, Route } from "react-router-dom";

import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from "@ionic/react";

import { useCallback, useState } from "react";
import { caretDownOutline } from "ionicons/icons";
import { IonReactRouter } from "@ionic/react-router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utilities */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Ionic dark mode */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

import ManualTimetablePage from "./pages/ManualTimetablePage";

import {
  MANUAL_TIMETABLES,
  getTimetableStorageKeys,
} from "./config/manualTimetables";

import Page5 from "./pages/CTimeTable5";
import Page6 from "./pages/ITimeTable1";
import Page7 from "./pages/ITimeTable2";

setupIonicReact();

const App: React.FC = () => {
  const [userMadeOpen, setUserMadeOpen] = useState(true);
  const [ocrOpen, setOcrOpen] = useState(true);

  /*
   * This state was missing from your version.
   * It allows menu titles to update immediately when a timetable
   * title is edited.
   */
  const [manualTitles, setManualTitles] = useState<
    Record<number, string>
  >(() => {
    const titles: Record<number, string> = {};

    MANUAL_TIMETABLES.forEach((page) => {
      const storageKeys = getTimetableStorageKeys(page.id);

      titles[page.id] =
        localStorage.getItem(storageKeys.title) ??
        page.defaultTitle;
    });

    return titles;
  });

  const toggleUserMade = () => {
    setUserMadeOpen((currentValue) => !currentValue);
  };

  const toggleOCRMade = () => {
    setOcrOpen((currentValue) => !currentValue);
  };

  const updateManualTitle = useCallback(
    (pageId: number, title: string) => {
      setManualTitles((currentTitles) => ({
        ...currentTitles,
        [pageId]: title,
      }));
    },
    [],
  );

  return (
    <IonApp>
      <IonReactRouter>
        <IonMenu contentId="main-content" type="overlay">
          <IonHeader>
            <IonToolbar>
              <IonTitle>TimeTables</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <IonList>
              {/* Cancelled lessons */}
              <IonMenuToggle>
                <IonItem button routerLink="/page5">
                  <IonLabel color="danger">
                    Cancelled Lessons
                  </IonLabel>
                </IonItem>
              </IonMenuToggle>

              {/* User-created timetable section */}
              <IonItem
                button
                detail={false}
                onClick={toggleUserMade}
              >
                <IonLabel>
                  <strong>User Made TimeTables</strong>
                </IonLabel>

                <IonIcon
                  slot="end"
                  icon={caretDownOutline}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: userMadeOpen
                      ? "rotate(0deg)"
                      : "rotate(-90deg)",
                  }}
                />
              </IonItem>

              <div
                style={{
                  opacity: userMadeOpen ? 1 : 0,
                  maxHeight: userMadeOpen ? "400px" : "0px",
                  overflow: "hidden",
                  transition:
                    "opacity 0.3s ease, max-height 0.3s ease",
                }}
              >
                {MANUAL_TIMETABLES.map((page) => (
                  <IonMenuToggle key={page.id}>
                    <IonItem button routerLink={page.path}>
                      <IonLabel color={'primary'}>
                        {manualTitles[page.id]}
                      </IonLabel>
                    </IonItem>
                  </IonMenuToggle>
                ))}
              </div>

              {/* OCR timetable section */}
              <IonItem
                button
                detail={false}
                onClick={toggleOCRMade}
              >
                <IonLabel>
                  <strong>Image Read TimeTables</strong>
                </IonLabel>

                <IonIcon
                  slot="end"
                  icon={caretDownOutline}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: ocrOpen
                      ? "rotate(0deg)"
                      : "rotate(-90deg)",
                  }}
                />
              </IonItem>

              <div
                style={{
                  opacity: ocrOpen ? 1 : 0,
                  maxHeight: ocrOpen ? "400px" : "0px",
                  overflow: "hidden",
                  transition:
                    "opacity 0.3s ease, max-height 0.3s ease",
                }}
              >
                <IonMenuToggle>
                  <IonItem button routerLink="/page6">
                    <IonLabel color={'primary'}>ITimeTable1</IonLabel>
                  </IonItem>
                </IonMenuToggle>

                <IonMenuToggle>
                  <IonItem button routerLink="/page7">
                      <IonLabel color={'primary'}>ITimeTable2</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              </div>
            </IonList>
          </IonContent>
        </IonMenu>

        <IonRouterOutlet id="main-content">
          {MANUAL_TIMETABLES.map((page) => (
            <Route
              exact
              key={page.id}
              path={page.path}
              render={() => (
                <ManualTimetablePage
                  pageId={page.id}
                  defaultTitle={page.defaultTitle}
                  onTitleChange={updateManualTitle}
                />
              )}
            />
          ))}

          <Route exact path="/page5">
            <Page5 />
          </Route>

          <Route exact path="/page6">
            <Page6 />
          </Route>

          <Route exact path="/page7">
            <Page7 />
          </Route>

          <Route exact path="/">
            <Redirect to="/page1" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;