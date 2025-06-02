import { IconAlertTriangle } from '@tabler/icons-react';
import { TextInput } from '@mantine/core';
import classes from '../../styles/InputValidation.module.css';

export function InputValidation() {
  return (
    <TextInput
      label="Email"
      error="Invalid email"
      defaultValue="hello!gmail.com"
      classNames={{ input: classes.invalid }}
      rightSection={<IconAlertTriangle stroke={1.5} size={18} className={classes.icon} />}
    />
  );
}