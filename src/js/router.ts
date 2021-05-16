import Router from "router-dom";
import { $$, $, render, hydro, setReactivity, html } from "hydro-js";
import { addPlace } from "./animation.js";

const mailIcon = ($("#mailIcon") as HTMLTemplateElement).content.cloneNode(true)
  .firstChild;
const plusIcon = ($("#plusIcon") as HTMLTemplateElement).content.cloneNode(true)
  .firstChild;
hydro.addPlace = addPlace;
setReactivity(plusIcon as Node);
let preloadedGroupImages = false;

new Router([
  {
    path: "/",
    templateUrl: "./pages/home.html",
    leave() {
      $(".header-img")!.classList.add("header-img-transition");
      return hideOrShow(true);
    },
    beforeEnter() {
      if (hydro.person?.fullname) {
        $(".profile-name")!.textContent = hydro.person.fullname;
      }
      $$(".nav-wrapper a")[0].classList.add("active-link");
      render(mailIcon, ".side-icon svg");
    },
    afterEnter({ from }) {
      if (from !== "/") {
        //@ts-ignore
        ($("header") as Element).classList = ["index"];
        return hideOrShow(false);
      }
    },
  },
  {
    path: "/place",
    templateUrl: "./pages/place.html",
    leave() {
      $(".header-img")!.classList.add("header-img-transition");
      return hideOrShow(true);
    },
    beforeEnter() {
      if (hydro.person?.fullname) {
        $(".profile-name")!.textContent = hydro.person.fullname;
      }
      $$(".nav-wrapper a")[1].classList.add("active-link");
      render(plusIcon, ".side-icon svg");
    },
    afterEnter() {
      //@ts-ignore
      $("header").classList = ["place"];
      return hideOrShow(false);
    },
  },
  {
    path: "/group",
    templateUrl: "./pages/group.html",
    leave() {
      ($(".profile-photo") as HTMLDivElement).style.transform = "";
      $(".header-img")!.classList.add("header-img-transition");
      return hideOrShow(true);
    },
    beforeEnter() {
      $(".profile-name")!.textContent = "Honolulu";
      $$(".nav-wrapper a")[2].classList.add("active-link");
      render(plusIcon, ".side-icon svg");
    },
    afterEnter() {
      //@ts-ignore
      $("header").classList = ["group"];
      return hideOrShow(false);
    },
  },
]);

addEventListener("popstate", () => {
  $(".active-link")!.classList.remove("active-link");
});

function hideOrShow(hide: boolean) {
  return $("[data-outlet]")!.animate(
    [{ opacity: hide ? "1" : "0" }, { opacity: hide ? "0" : "1" }],
    {
      duration: 90,
      fill: "forwards",
      easing: "ease-in",
    }
  ).finished;
}
