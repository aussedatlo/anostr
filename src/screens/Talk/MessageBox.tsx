import React, { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar as AvatarPaper, Text, useTheme } from 'react-native-paper';
import { Side } from '.';
import Avatar from '../../components/Avatar';
import { Theme } from '../../providers/ThemeProvider';
import { Message } from '../../types/message';
import { User } from '../../types/user';
import MenuMessageBox from './MenuMessageBox';
import ReactionBox from './ReactionBox';

type MessageBoxProps = {
  message: Message;
  user: User;
  side: Side;
  onReply: (message: Message) => void;
};

const MessageBox = ({ message, user, side, onReply }: MessageBoxProps) => {
  const theme = useTheme<Theme>();
  const styles = useMemo(() => createStyles(theme, side), [theme]);
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <View style={styles.root}>
      {side === 'left' ? (
        <Avatar picture={user.picture} pubkey={user.pubkey} size={35} />
      ) : (
        <></>
      )}
      <View style={styles.container}>
        <Pressable
          onLongPress={() => setVisible(true)}
          android_ripple={{ color: theme.colors.backdrop }}
          style={styles.pressable}
        >
          <Text style={styles.content}>{message.content}</Text>
          {side === 'right' ? (
            <View style={styles.checkContainer}>
              <AvatarPaper.Icon
                icon={'check-bold'}
                size={12}
                style={!message.pending ? styles.check : styles.hide}
                color={theme.colors.primary}
              />
            </View>
          ) : (
            <></>
          )}
        </Pressable>
        <MenuMessageBox
          message={message}
          onChange={setVisible}
          onReply={onReply}
          visible={visible}
        />
      </View>
      <ReactionBox message={message} side={side} />
    </View>
  );
};

const createStyles = ({ colors }: Theme, side: Side) => {
  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: side === 'right' ? 'flex-end' : 'flex-start',
      paddingLeft: 5,
      paddingRight: 5,
    },
    avatar: {
      marginLeft: 5,
    },
    container: {
      overflow: 'hidden',
      padding: 0,
      maxWidth: '70%',
      marginBottom: 2,
      borderRadius: 15,
      marginLeft: 5,
      backgroundColor: side === 'right' ? colors.primary : colors.secondary,
    },
    pressable: {
      flexDirection: 'row',
      padding: 15,
    },
    content: {
      color: side === 'right' ? colors.onPrimary : colors.onSecondary,
      paddingRight: 8,
      flexShrink: 1,
    },
    checkContainer: {
      flexDirection: 'row',
      height: '100%',
      alignItems: 'flex-end',
    },
    check: {
      marginBottom: 3,
      backgroundColor: colors.primaryContainer,
    },
    hide: {
      marginBottom: 3,
      backgroundColor: colors.transparent,
      color: colors.transparent,
    },
  });
};

export default memo(MessageBox);
