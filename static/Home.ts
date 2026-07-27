export const slider_items = [
    //slider items
    {
        key: 0,
        image: require("@assets/card1.png"),
        mask: require("@assets/card1mask.png"),
        lableline1: "Make\nYour Back",
        lableline2: "Massive",
        coverleft: false,
    },
    {
        key: 1,
        image: require("@assets/card2.png"),
        mask: require("@assets/card2mask.png"),
        lableline1: "Make\nYour Back",
        lableline2: "Massive",
        coverleft: true,
    },
    {
        key: 2,
        image: require("@assets/card2.png"),
        mask: require("@assets/card2mask.png"),
        lableline1: "Make\nYour Back",
        lableline2: "Massive",
        coverleft: true,
    },
    {
        key: 3,
        image: require("@assets/card2.png"),
        mask: require("@assets/card2mask.png"),
        lableline1: "Make\nYour Back",
        lableline2: "Massive",
        coverleft: true,
    },
];

export const sidemenuData = [
    {
        id: 1, // menu id
        title: "My Profile", // menu title
        icon: require("@assets/sidemenu/profile.png"), // menu icon
        switch: false, // show switch ? true/false
        switchstate: false, // switch is active ? true/false
    },
    {
        id: 2,
        title: "My Favorite",
        icon: require("@assets/sidemenu/myfav.png"),
        switch: false,
        switchstate: false,
    },
    {
        id: 3,
        title: "General Setting",
        icon: require("@assets/sidemenu/setting.png"),
        switch: false,
        switchstate: false,
    },
    {
        id: 4,
        title: "Apple Health",
        icon: require("@assets/sidemenu/applehealth.png"),
        switch: true,
        switchstate: true,
    },
    {
        id: 5,
        title: "Smart Watch",
        icon: require("@assets/sidemenu/smartwatch.png"),
        switch: true,
        switchstate: false,
    },
];

export const sliderTabItemsData = [
    //slider tabs
    {
        key: 0, // key
        value: "Strengths", // name
        sliderkey: 0, // slider key | must be same as the slider_items key
        width: 0
    },
    { key: 1, value: "Cardio", sliderkey: 1, width: 0 },
    { key: 2, value: "Yoga", sliderkey: 2, width: 0 },
    { key: 3, value: "Meditation", sliderkey: 3, width: 0 },
]