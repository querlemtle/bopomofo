import { Howl, Howler } from "howler";

const bgm = new Howl({
	src: ["/sounds/telling-the-story.mp3"],
	autoplay: true,
	loop: true,
	volume: 0.5
});

const sfx = new Howl({
	src: ["/sounds/burst.mp3"],
	loop: false
});

export { bgm, sfx };
