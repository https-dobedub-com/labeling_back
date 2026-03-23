import { BadRequestException, ValidationPipe, type ValidationError } from '@nestjs/common';

const errorMessages: Record<string, (property: string) => string> = {
    isNotEmpty: (property) => `${property}은(는) 비어있을 수 없습니다.`,
    isString: (property) => `${property}은(는) 문자열이어야 합니다.`,
    isEnum: (property) => `${property}은(는) 유효한 타입이 아닙니다.`,
    isInt: (property) => `${property}은(는) 정수여야 합니다.`,
    min: (property) => `${property}의 최소값 조건을 확인해주세요.`,
    max: (property) => `${property}의 최대값 조건을 확인해주세요.`,
};

const getFirstErrorMessage = (error: ValidationError): string => {
    if (error.constraints) {
        const constraintKey = Object.keys(error.constraints)[0];

        if (errorMessages[constraintKey]) {
            return errorMessages[constraintKey](error.property);
        }

        return Object.values(error.constraints)[0];
    }

    if (error.children && error.children.length > 0) {
        return getFirstErrorMessage(error.children[0]);
    }

    return '잘못된 요청입니다.';
};

export const requesterValidatorPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
        const message = getFirstErrorMessage(errors[0]);
        throw new BadRequestException(message, { cause: message });
    },
});
