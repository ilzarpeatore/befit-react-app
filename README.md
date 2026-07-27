# befit

befit react-native app 

## Installation

first, install project dependencies using "yarn" in the project folder

```bash
yarn install
```

note: make sure to install "expo-cli", "npm" , "composer" and "yarn"  beforehand

## usage

start the project using yarn

```bash
yarn start
```

for viewing different pages replace the page-tag in line 103 of the App.js

### page list :
```javascript

- <Home/> : home page / figma page names : Home,Side Menu
- <Club/> : club page / figma page names : Club
- <Stories/> : stories page / figma page names : Stories
- <Clubmap/> : clubmap page / figma page names : Club Map (3 pages),
- <Cycling/> : cycling page / figma page names : Start Cycling,While Cycling,Stop Cycling (2 pages)
- <Congratulation/> : congratulation page / figma page names : congratulations
- <Resault/> : Resault page / figma page names : Finished Cycling
- <Unboarding/> : Unboarding page / figma page names : Onboarding 01,Onboarding 02,Onboarding 03,Onboarding 04,Onboarding 05
- <Weight/> : Weight page / figma page names : Weight
- <Height/> : Height page / figma page names : Height
- <Name/> : Name page / figma page names : Name,Name - Active,Birthday,Birthday - Active
- <Challenges/> : Challenges page / figma page names : Challenges
- <Today/> : Today page / figma page names : Today
- <Workout/> : Workout page / figma page names : Workout(2 pages)
- <Profile/> : Profile page / figma page names : My Profile,Profile - Others,Profile - Others - Stories

```
## deploy:

for using mapView you should follow [map view deploying to a standalone app](https://docs.expo.io/versions/latest/sdk/map-view/#deploying-to-a-standalone-app-on-android) guide

using mapView without API key will screen to crash in production