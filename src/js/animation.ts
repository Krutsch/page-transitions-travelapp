import { TimelineMax, Expo, Sine, Back, TweenMax } from "gsap";

let saved = false;
function addAnimation() {
  const tl = new TimelineMax();
  tl.add("start");
  tl.to(
    ".plus",
    0.75,
    {
      rotation: -360,
      transformOrigin: "50% 50%",
      ease: Expo.easeOut,
    },
    "start"
  );
  tl.to(
    ".line2",
    0.7,
    {
      scaleY: 0.5,
      x: -2,
      rotation: -45,
      transformOrigin: "50% 100%",
      ease: Expo.easeOut,
    },
    "start"
  );
  tl.to(
    ".line1",
    0.7,
    {
      rotation: -50,
      x: 7,
      scaleX: 3,
      transformOrigin: "50% 100%",
      ease: Expo.easeOut,
    },
    "start"
  );
  tl.fromTo(
    ".save-info",
    0.5,
    {
      autoAlpha: 0,
    },
    {
      autoAlpha: 1,
      ease: Sine.easeOut,
    },
    "start"
  );
  tl.to(
    ".save-info",
    0.4,
    {
      autoAlpha: 0,
      ease: Expo.easeIn,
    },
    "start+=1"
  );
  return tl;
}
function removeAnimation() {
  const tl = new TimelineMax();
  tl.add("begin");
  tl.to(
    ".plus",
    0.75,
    {
      rotation: 0,
      transformOrigin: "50% 50%",
      ease: Expo.easeOut,
    },
    "begin"
  );
  tl.to(
    ".line2",
    0.7,
    {
      scaleY: 1,
      x: 0,
      rotation: 0,
      transformOrigin: "50% 100%",
      ease: Expo.easeOut,
    },
    "begin"
  );
  tl.to(
    ".line1",
    0.7,
    {
      rotation: 0,
      x: 0,
      scaleX: 1,
      transformOrigin: "50% 100%",
      ease: Back.easeOut,
    },
    "begin"
  );
  tl.timeScale(1.2);
  return tl;
}

export function openMenu() {
  TweenMax.to(".first", 0.2, {
    x: 18,
    ease: Sine.easeOut,
  });
  TweenMax.to(".last", 0.2, {
    x: -18,
    ease: Sine.easeOut,
  });
  TweenMax.staggerTo(
    ".first, .middle, .last",
    0.2,
    {
      fill: "#7eebe6",
      ease: Sine.easeOut,
    },
    //@ts-ignore
    0.04
  );
}
export function closeMenu() {
  TweenMax.to(".first", 0.2, {
    x: 0,
    ease: Sine.easeIn,
  });
  TweenMax.to(".last", 0.2, {
    x: 0,
    ease: Sine.easeIn,
  });
  TweenMax.to(".first, .middle, .last", 0.2, {
    fill: "#fff",
  });
}

export function addPlace() {
  if (!saved) {
    addAnimation();
    saved = true;
  } else {
    removeAnimation();
    saved = false;
  }
}
