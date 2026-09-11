const MAX_QUESTION_LENGTH = 1000;

const normalizeText = (value) => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().replace(/\s+/g, ' ');
};

const prepareQuestion = (question) => {
    const normalizedQuestion = normalizeText(question);

    if (!normalizedQuestion || normalizedQuestion.length > MAX_QUESTION_LENGTH) {
        return null;
    }

    return normalizedQuestion;
};

module.exports = {
    MAX_QUESTION_LENGTH,
    normalizeText,
    prepareQuestion,
};