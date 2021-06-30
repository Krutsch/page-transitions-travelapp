import Router from "router-dom";
import { $$, $, render, hydro, setReactivity } from "hydro-js";
import { addPlace } from "./animation.js";

const mailIcon = ($("#mailIcon") as HTMLTemplateElement).content.cloneNode(
  true
).firstChild;
const plusIcon = ($("#plusIcon") as HTMLTemplateElement).content.cloneNode(
  true
).firstChild;
setReactivity(plusIcon as Element, { addPlace });

const footer = $("footer")!;
addEventListener("afterRouting", () => {
  if (footer.hidden) footer.hidden = false;
});

new Router(
  [
    {
      path: "/",
      templateUrl: "/pages/home.html",
      leave() {
        return hideOrShow(true);
      },
      beforeEnter() {
        if (hydro.person?.fullname) {
          $(".profile-name")!.textContent = hydro.person.fullname;
        }
        $$(".nav-wrapper a")[0].classList.add("active-link");
        render(mailIcon, ".side-icon svg");
      },
      afterEnter() {
        $("header")!.className = "index";
        return hideOrShow(false);
      },
      restoreScrollOnReload: true,
    },
    {
      path: "/place",
      templateUrl: "/pages/place.html",
      leave() {
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
        $("header")!.className = "place";
        return hideOrShow(false);
      },
      restoreScrollOnReload: true,
    },
    {
      path: "/group",
      templateUrl: "/pages/group.html",
      leave() {
        ($(".profile-photo") as HTMLDivElement).style.transform = "";
        return hideOrShow(true);
      },
      beforeEnter() {
        $(".profile-name")!.textContent = "Honolulu";
        $$(".nav-wrapper a")[2].classList.add("active-link");
        render(plusIcon, ".side-icon svg");
      },
      afterEnter() {
        $("header")!.className = "group";
        return hideOrShow(false);
      },
      restoreScrollOnReload: true,
    },
  ],
  { scrollBehavior: "smooth" }
);

const headerImg = $(".header-img")!;
addEventListener("beforeRouting", () => {
  $(".active-link")?.classList.remove("active-link");
  headerImg.classList.add("header-img-transition");
});

function hideOrShow(hide: boolean) {
  return $("[data-outlet]")!.animate(
    [{ opacity: hide ? "1" : "0" }, { opacity: hide ? "0" : "1" }],
    {
      duration: 190,
      fill: "forwards",
      easing: "ease-in",
    }
  ).finished;
}
