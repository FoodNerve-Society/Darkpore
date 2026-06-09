export const useJourneyState = ({ journeySteps }: any) => {
    return {
        activeChapterIndex: 0,
        changeChapter: (index: number) => {},
    };
};
