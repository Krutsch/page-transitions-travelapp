import "progressive-picture";
import { setReactivity, $, $$, hydro } from "hydro-js";
import { openMenu, closeMenu } from "./animation.js";

const headerImg = $(".header-img")!;
const followElem = $(".follow")!;
const span = $(".follow span")!;
const menuDrawer = $(".menudrawer")!;

let isOpen = false;

setBindings();

function setBindings() {
  setReactivity(document.body, {
    toggle() {
      followElem.classList.toggle("active-follow");
      const willFollow = span.textContent === "Follow";
      if (willFollow) {
        span.textContent = "✔ Following";
        hydro.person.followers += 1;
      } else {
        span.textContent = "Follow";
        hydro.person.followers -= 1;
      }
    },
    toggleMenu() {
      menuDrawer.classList.toggle("hide-menu");
      if (isOpen) {
        isOpen = false;
        closeMenu();
      } else {
        isOpen = true;
        openMenu();
      }
    },
    transitionend() {
      headerImg.classList.remove("header-img-transition");
    },
    selectProfile({ target }: any) {
      if (location.pathname !== "/group") return;

      const div =
        target.parentNode.localName === "div"
          ? target.parentNode
          : target.closest("div");
      const profileDiv = $(".profile-photo") as HTMLDivElement;

      const index = Number(div.dataset.pos);
      const pIdx = [...div.classList.values()]
        .filter((className) => /profile-\d/.test(className))
        .pop()
        .split("profile-")
        .pop();

      const newPerson = { ...hydro.persons[pIdx] };
      hydro.person.fullname = newPerson.fullname;
      hydro.person.firstname = newPerson.firstname;
      hydro.person.followers = newPerson.followers;
      hydro.person.following = newPerson.following;

      profileDiv.classList.remove("profile-photo");
      profileDiv.classList.add("profile-photo-secondary");
      profileDiv.style.transform = `perspective(1px) translate3d(${
        -70 + index * 55
      }px, -70px, 0) scale(0.25)`;
      profileDiv.dataset.pos = String(index);

      div.classList.remove("profile-photo-secondary");
      div.classList.add("profile-photo");
      div.style.transform = `perspective(1px) translate3d(-70px, -70px, 0) scale(0.25)`;
      div.dataset.pos = "0";
    },
  });
}

const startInvisible = "start-invisible";
$$(`.${startInvisible}`).forEach((elem) => {
  elem.classList.remove(startInvisible);
});

// Listener for HMR
if (process.env.NODE_ENV !== "production") {
  addEventListener("afterRouting", () => {
    if (document.body.textContent!.includes("{{")) setBindings();
    $$(`.${startInvisible}`).forEach((elem) => {
      elem.classList.remove(startInvisible);
    });
  });
}
