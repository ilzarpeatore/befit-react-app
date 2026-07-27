import { storiesDataInterface } from "@pages/_types/Profile.i";

export const stories = [
    //stories items
    {
        id: 1, //story id | type : integer
        image: require("@assets/profile/story.png"), //story image | type : image
        likes: "3.2K", //story likes | type : integer/string
        playable: false, //story is video | type : bool | this will only show a play icon on top left of the story image nothing more
    },
    {
        id: 2,
        image: require("@assets/profile/story2.png"),
        likes: "5.7K",
        playable: false,
    },
    {
        id: 3,
        image: require("@assets/profile/story3.png"),
        likes: "1.9K",
        playable: true,
    },
];