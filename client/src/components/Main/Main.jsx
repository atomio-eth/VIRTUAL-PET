import { useState, useEffect } from "react";
import "./Main.css";
import KiwiImg from "../../assets/imgs/kiwi1.png";
import Egg from "../../assets/imgs/egg-gif.gif";
import BabyKiwi from "../../assets/imgs/baby-kiwi.png";
import YoungKiwi from "../../assets/imgs/young-kiwi.png";
import AdultKiwi from "../../assets/imgs/young-kiwi.png";
import OldKiwi from "../../assets/imgs/young-kiwi.png";
import DeadKiwi from "../../assets/imgs/kiwi-dead.png";
import SpeechBubble from "../../assets/imgs/speech-bubble.svg";
import axios from "axios";
import { clearLocalStorage } from "../../utils/utils";

const Main = ({ currentUser, setCurrentUser, setIsAuth }) => {
  const { pet, username } = currentUser;
  const { full_level, happy_level, health_level, smart_level, level } = pet;

  const [feed, setFeed] = useState(full_level);
  const [play, setPlay] = useState(happy_level);
  const [study, setStudy] = useState(smart_level);
  const [health, setHealth] = useState(health_level);

  const [actionClicked, setActionClicked] = useState(true);

  const [kiwiImage, setKiwiImage] = useState("");
  const [kiwiMessage, setKiwiMessage] = useState("noo im hundryu..!!");
  const [kiwiIsDead, setKiwiIsDead] = useState(false);

  useEffect(() => {
    const { last_cared } = pet;
    const getDiff = (older) => {
      let reqBody = { stat: "" };
      const msDiff = Math.abs(
        new Date(older) - new Date(new Date().toISOString())
      );
      const hrsNotCared = msDiff / (60 * 60 * 1000);

      setKiwiImage(() => {
        if (hrsNotCared >= 24 || health_level <= 0) {
          setKiwiIsDead(true);
          return DeadKiwi;
        } else if (level === 0) {
          return Egg;
        } else if (level === 1) {
          return BabyKiwi;
        } else if (level === 2) {
          return YoungKiwi;
        } else if (level === 3) {
          return AdultKiwi;
        } else if (level > 3) {
          return OldKiwi;
        }
      });

      if (hrsNotCared >= 24) return;
      else if (hrsNotCared < 12 && hrsNotCared >= 6) {
        // console.log("dropping stat by a lot");
        return (reqBody.stat = 5);
      } else if (hrsNotCared < 6 && hrsNotCared >= 3) {
        // console.log("dropping stat by medium");
        return (reqBody.stat = 3);
      } else if (hrsNotCared < 3 && hrsNotCared >= 1) {
        // console.log("dropping stat by almost nothing");
        return (reqBody.stat = 1);
      } else {
        // console.log("Taking good care within the hour");
      }
      return (reqBody.stat = "");
    };

    const stat = getDiff(last_cared);
    const setDiff = async (stat) => {
      if (stat === 5 || stat === 3 || stat === 1) {
        await axios
          .patch("/api/v1/pet/drop", {
            username,
            stat,
          })
          .then((serverRes) => {
            setCurrentUser({ ...currentUser, pet: serverRes.data });
          })
          .catch((err) => console.log(err));
      }
      return;
    };
    setDiff(stat);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (parameter, state, action) => {
    if (kiwiIsDead) return;
    await axios
      .patch(`/api/v1/pet/${parameter}`, { username })
      .then((serverRes) => {
        setKiwiMessage(serverRes.data.message);
      })
      .catch((err) => console.log(err));
    action((state) => {
      if (state + 10 > 100) {
        return (state = 100);
      }
      return state + 10;
    });
    setActionClicked(true);
    setTimeout(() => setActionClicked(false), 4000);
  };

  const handleFeed = () => handleAction("feed", feed, setFeed);

  const handlePlay = () => handleAction("play", play, setPlay);

  const handleStudy = () => handleAction("study", study, setStudy);

  const handleHealth = () => handleAction("vet", health, setHealth);

  const handleLogout = () => {
    clearLocalStorage();
    setIsAuth(false);
  };

  return (
    <div className="home__container">
      <div className="home_img__wrapper">
        <img src={KiwiImg} alt="cute brown bird" className="kiwi_img" />
      </div>
      {actionClicked && (
        <div className="speech_bubble">
          <img src={SpeechBubble} alt="speech bubble" className="kiwi_img" />
          <p className="kiwi_message">{kiwiMessage}</p>
        </div>
      )}
      <div className="home_hero__container">
        <>
          <h1>Virtual Kiwi!</h1>
          <p className="hero_desc">Welcome to your personal kiwi!</p>
        </>
        <div className="pet_box">
          <img src={kiwiImage} alt="draw of a kiwi" className="pet_img" />
        </div>
        <div className="stats__container">
          <div className="stat__wrapper">
            <p>Health: {health}%</p>
          </div>
          <div className="stat__wrapper">
            <p>Food: {feed}%</p>
          </div>
          <div className="stat__wrapper">
            <p>Happy: {play}%</p>
          </div>
          <div className="stat__wrapper">
            <p>Smart: {study}%</p>
          </div>
        </div>
        {!kiwiIsDead && (
          <div className="pet_actions_box">
            <button
              onClick={handleFeed}
              className="button button_base button_action btn_kiwi"
            >
              Feed
            </button>
            <button
              onClick={handleHealth}
              className="button button_base button_action btn_kiwi"
            >
              Vet
            </button>
            <button
              onClick={handlePlay}
              className="button button_base button_action btn_kiwi"
            >
              Play
            </button>
            <button
              onClick={handleStudy}
              className="button button_base button_action btn_kiwi"
            >
              Study
            </button>
          </div>
        )}
        <button onClick={handleLogout} className="button button_base">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Main;
