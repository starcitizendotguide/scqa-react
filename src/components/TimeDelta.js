import Tooltip from "./Tooltip";

const TimeDelta = ({ timestamp, ref }) => {
    const delta = Date.now() / 1000 - timestamp;
    const yearInSeconds = 60 * 60 * 24 * 365;

    const getClassAndTooltip = () => {
        if (delta > 3 * yearInSeconds) {
            return { className: 'text-red-500', tooltip: 'This answer is older than 3 years.' };
        } else if (delta > 1 * yearInSeconds) {
            return { className: 'text-yellow-500', tooltip: 'This answer is older than 1 year.' };
        } else {
            return { className: 'text-green-500', tooltip: 'This answer is younger than 1 year.' };
        }
    };

    const { className, tooltip } = getClassAndTooltip();

    const formattedDate = new Date(timestamp * 1000).toISOString().split('T')[0];

    return (
        <span ref={ref} className={`relative group`}>
            <Tooltip className='relative' message={tooltip}>
                {formattedDate}
            </Tooltip>
        </span>
    );
};

export default TimeDelta;
