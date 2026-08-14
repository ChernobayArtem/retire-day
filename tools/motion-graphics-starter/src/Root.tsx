import { Composition } from "remotion";
import { FreedomSunrise, freedomSchema } from "./compositions/FreedomSunrise";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FreedomSunrise"
        component={FreedomSunrise}
        width={1080}
        height={800}
        fps={30}
        durationInFrames={240}
        schema={freedomSchema}
        defaultProps={{
          skyTop: "#f7c79c",
          skyMid: "#ffd0cd",
          skyLow: "#fff2e6",
          sunColor: "#ffd98a",
          sunGlow: "#ffe7b4",
          hillColor: "#f2b6a2",
          meadow: "#b6df97",
          balloonColors: ["#ff9ec4", "#ffc16e", "#b8a4ff", "#7cc5ff", "#ff8fa3"],
          heartColor: "#ff8fa8",
          sparkleColor: "#fff3cf",
          floatIntensity: 1,
        }}
      />
    </>
  );
};
