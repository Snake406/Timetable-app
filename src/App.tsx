import { Redirect, Route } from 'react-router-dom';
"THE BELOW LINE IS AN IMPORT OF EVERTYTHIING"
import { IonApp, IonRouterOutlet, setupIonicReact,IonMenu,IonContent,IonHeader,IonIcon,IonItem,IonLabel,IonList,IonMenuToggle,IonRouterLink,IonTitle,IonToolbar
} from "@ionic/react";

import { useState} from 'react';

import {caretDownOutline} from "ionicons/icons"; 
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import Page1 from './pages/TimeTable1';
import Page2 from './pages/TimeTable2';
import Page3 from './pages/TimeTable3';
import Page4 from './pages/TimeTable4';
import Page5 from './pages/CTimeTable5';
import Page6 from './pages/ITimeTable1';
import Page7 from './pages/ITimeTable2';



setupIonicReact();



const App: React.FC = () => {
  const [userMadeOpen, setUserMadeOpen] = useState(true);
  const [OCROpen, setOCROpen] = useState(true);


  const toggleUserMade = () => setUserMadeOpen((prev) => !prev);
  const toggleOCRMade = () => setOCROpen((prev) => !prev);

  const savedTitle = localStorage.getItem("timetableTitle");
  const savedTitle2 = localStorage.getItem("timetableTitle2");
  const savedTitle3 = localStorage.getItem("timetableTitle3");
  const savedTitle4 = localStorage.getItem("timetableTitle4");
  return (
    <IonApp>
      <IonReactRouter>
        {/* Side Menu */}
        <IonMenu contentId="menu" type="overlay">
          <IonHeader>
            <IonToolbar>
              <IonTitle>TimeTables</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <IonList>
              {/* Always-visible section */}
              <IonMenuToggle>
                <IonItem routerLink="/page5">
                  <IonRouterLink color={"danger"}>Cancelled Lessons</IonRouterLink>
                </IonItem>
              </IonMenuToggle>

              {/* 🧩 Collapsible Section Header */}
              <IonItem
                button
                detail={false}
                onClick={toggleUserMade}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IonLabel>
                  <strong>User Made TimeTables</strong>
                </IonLabel>
                <IonIcon
                  icon={caretDownOutline}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: userMadeOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  }}
                />
              </IonItem>

              {/* 👇 Collapsible Content */}
              <div
                style={{
                  transition: "all 0.4s allow-discrete",
                  opacity: userMadeOpen ? 1 : 0,
                  maxHeight: userMadeOpen ? "400px" : "0px",
                }}
              >
                <IonMenuToggle>
                  <IonItem routerLink="/page1">
                    <IonRouterLink>{savedTitle}</IonRouterLink>
                  </IonItem>
                </IonMenuToggle>

                <IonMenuToggle>
                  <IonItem routerLink="/page2">
                    <IonRouterLink>{savedTitle2}</IonRouterLink>
                  </IonItem>
                </IonMenuToggle>

                <IonMenuToggle>
                  <IonItem routerLink="/page3">
                    <IonRouterLink>{savedTitle3}</IonRouterLink>
                  </IonItem>
                </IonMenuToggle>

                <IonMenuToggle>
                  <IonItem routerLink="/page4">
                    <IonRouterLink>{savedTitle4}</IonRouterLink>
                  </IonItem>
                </IonMenuToggle>
              </div>

              {/* 🧩 Collapsible Section Header */}
              <IonItem
                button
                detail={false}
                onClick={toggleOCRMade}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IonLabel>
                  <strong>Image Read TimeTables</strong>
                </IonLabel>
                <IonIcon
                  icon={caretDownOutline}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: OCROpen ? "rotate(0deg)" : "rotate(-90deg)",
                  }}
                />
              </IonItem>

              {/* 👇 Collapsible Content */}
 <div
  style={{
    transition: "all 0.4s allow-discrete",
    opacity: OCROpen ? 1 : 0,
    maxHeight: OCROpen ? "400px" : "0px",
  }}
>
  <IonMenuToggle>
    <IonItem routerLink="/page6">
      <IonRouterLink>ITimeTable1</IonRouterLink>
    </IonItem>
  </IonMenuToggle>

  <IonMenuToggle>
    <IonItem routerLink="/page7">
      <IonRouterLink>ITimeTable2</IonRouterLink>
    </IonItem>
  </IonMenuToggle>
</div>
              
            </IonList>
          </IonContent>
        </IonMenu>

        {/* Navigation Routing */}
        <IonRouterOutlet id="menu">
          <Route exact path="/page1">
            <Page1 />
          </Route>
          <Route exact path="/page2">
            <Page2 />
          </Route>
          <Route exact path="/page3">
            <Page3 />
          </Route>
          <Route exact path="/page4">
            <Page4 />
          </Route>
          <Route exact path="/page5">
            <Page5 />
          </Route>
          <Route exact path="/Page6">
            <Page6 />
          </Route>
           <Route exact path="/Page7">
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