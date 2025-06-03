import { IconAlertTriangle } from '@tabler/icons-react';
import { TextInput, TextInputProps } from '@mantine/core';
import classes from '../../styles/InputValidation.module.css';

interface InputValidationProps extends TextInputProps {}

export function InputValidation(props: InputValidationProps) {
  return (
    <TextInput
      label="Email"
      placeholder="you@example.com"
      classNames={{ input: classes.invalid }}
      rightSection={<IconAlertTriangle stroke={1.5} size={18} className={classes.icon} />}
      {...props}
    />
  );
}
