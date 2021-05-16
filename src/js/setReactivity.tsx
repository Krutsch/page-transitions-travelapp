import "progressive-picture";
import { setReactivity, $, hydro, render, h } from "hydro-js";
import { openMenu, closeMenu } from "./animation.js";

const headerImg = $(".header-img")!;
const followElem = $(".follow")!;
const span = $(".follow span")!;
const menuDrawer = $(".menudrawer")!;
const persons = [
  {
    fullname: "Sophia Gonzalez",
    firstname: "Sophia",
    followers: 2748,
    following: 789,
  },
  {
    fullname: "Ben Allen",
    firstname: "Ben",
    followers: 789,
    following: 140,
  },
  {
    fullname: "Jill Fernandez",
    firstname: "Jill",
    followers: 1705,
    following: 590,
  },
  {
    fullname: "Cynthia Obel",
    firstname: "Cynthia",
    followers: 1705,
    following: 590,
  },
];

hydro.person = { ...persons[0] };
let isOpen = false;

setReactivity(document.body, {
  toggle: () => {
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
  toggleMenu: () => {
    if (isOpen) {
      isOpen = false;
      closeMenu();
      menuDrawer.classList.add("hide-menu");
    } else {
      isOpen = true;
      menuDrawer.classList.remove("hide-menu");
      openMenu();
    }
  },
  transitionend: () => {
    headerImg.classList.remove("header-img-transition");
  },
  selectProfile: ({ target }: any) => {
    if (location.pathname !== "/group") return;
    const div =
      target.parentNode.localName === "div"
        ? target.parentNode
        : target.closest("div");
    const profileDiv = $(".profile-photo") as HTMLDivElement;

    const index = [...div.classList.values()]
      .filter((className) => /profile-\d/.test(className))
      .pop()
      .split("profile-")
      .pop();
    const indexReplacment = [...profileDiv.classList.values()]
      .filter((className) => /profile-\d/.test(className))
      .pop()!
      .split("profile-")
      .pop();
    const multIndex = Number(index) || Number(indexReplacment);

    const newPerson = persons[index];
    hydro.person.fullname = newPerson.fullname;
    hydro.person.firstname = newPerson.firstname;
    hydro.person.followers = newPerson.followers;
    hydro.person.following = newPerson.following;

    profileDiv.classList.remove("profile-photo");
    profileDiv.classList.add("profile-photo-secondary");
    profileDiv.style.transform = `perspective(1px) translate3d(${
      -70 + multIndex * 55
    }px, -70px, 0) scale(0.25)`;

    div.classList.remove("profile-photo-secondary");
    div.classList.add("profile-photo");
    div.style.transform = `perspective(1px) translate3d(-70px, -70px, 0) scale(0.25)`;
  },
});

// Show the content
const style = <style></style>;
style.textContent = `*,
*:before,
*:after {
  color: inherit;
  background-clip: initial;
  -webkit-background-clip: initial;
}`;
render(style);

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: HTMLElement & any;
    }
  }
}
