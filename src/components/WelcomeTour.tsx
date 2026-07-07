import { useEffect, useState } from "react";
import { Joyride, CallBackProps, STATUS, Step } from "react-joyride";

const TOUR_STEPS: Step[] = [
  {
    target: ".tour-start",
    content: "Welcome to WIBO! Let's take a quick tour of our new features to help you find the right auto parts faster.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: ".chassis-search-tab", // Note: Need to add this class to the tabs if not present
    content: "You can now search for parts using your specific Vehicle Chassis Code (e.g., NZE121) for 100% accurate fitment.",
    placement: "bottom",
  },
  {
    target: ".symptom-search-tab",
    content: "Not sure what's broken? Type the symptoms (like 'squeaking brakes') and our AI will diagnose the problem and recommend parts.",
    placement: "bottom",
  },
  {
    target: ".garage-button",
    content: "Save your vehicle to your Garage so you never have to type it again when searching for parts.",
    placement: "left",
  },
  {
    target: ".boni-ai-chat",
    content: "Meet Boni, your AI Auto Parts Advisor. Ask Boni anything about parts, maintenance, or pricing anytime!",
    placement: "top-start",
  },
];

export const WelcomeTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run if the user hasn't seen it before
    const hasSeenTour = localStorage.getItem("wibo_has_seen_tour");
    if (!hasSeenTour) {
      // Delay slightly so the UI can render
      const timer = setTimeout(() => setRun(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("wibo_has_seen_tour", "true");
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous={true}
      scrollToFirstStep={false}
      disableScrolling={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#E50914", // WIBO Primary Red
          textColor: "#333",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "8px",
          fontFamily: "Outfit, sans-serif",
        },
        buttonNext: {
          backgroundColor: "#E50914",
          borderRadius: "4px",
        },
      }}
    />
  );
};
