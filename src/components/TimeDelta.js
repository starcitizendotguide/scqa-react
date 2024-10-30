import Tooltip from "./Tooltip";

const TimeDelta = ({ timestamp }) => {
    const delta = Date.now() / 1000 - timestamp;
    const yearInSeconds = 60 * 60 * 24 * 365;

    const getClassAndTooltip = () => {
        if (delta > 3 * yearInSeconds) {
            return { tooltip: 'This answer is older than 3 years.' };
        } else if (delta > 1 * yearInSeconds) {
            return { tooltip: 'This answer is older than 1 year.' };
        } else {
            return { tooltip: 'This answer is less than 1 year old.' };
        }
    };

    const { tooltip } = getClassAndTooltip();

    try {
        const formattedDate = new Date(timestamp * 1000).toISOString().split('T')[0];

        return (
            <span className={`relative group`}>
                <Tooltip message={tooltip}>
                    {formattedDate}
                </Tooltip>
            </span>
        );
    } catch(error) {
        console.log(timestamp);
        console.error(error);
    } 

};

export default TimeDelta;
