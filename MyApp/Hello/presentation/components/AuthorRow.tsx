import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Avatar from './Avatar';

export interface AuthorRowProps {
    fullName: string;
    linkText?: string;
    onPressLinkText?: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

export default class AuthorRow extends React.Component<AuthorRowProps> {
    static defaultProps = { linkText: '', isFavorite: false };

    override render() {
        const { fullName, linkText, onPressLinkText, isFavorite, onToggleFavorite } = this.props;
        return (
            <View style={styles.container}>
                <Avatar
                    size={36}
                    initials={fullName}
                    backgroundColor={'#4f6df5'}
                />
                <Text style={styles.text} numberOfLines={1}>
                    {fullName}
                </Text>
                {onToggleFavorite && (
                    <TouchableOpacity onPress={onToggleFavorite} style={styles.heart}>
                        <Text style={[styles.heartText, isFavorite && styles.heartOn]}>
                            {isFavorite ? '♥' : '♡'}
                        </Text>
                    </TouchableOpacity>
                )}
                {!!linkText && (
                    <TouchableOpacity onPress={onPressLinkText}>
                        <Text style={styles.link}>{linkText}</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    text: {
        flex: 1,
        marginHorizontal: 10,
        color: '#222',
        fontSize: 15,
        fontWeight: '600',
    },
    heart: { marginRight: 14 },
    heartText: { fontSize: 22, color: '#999' },
    heartOn: { color: '#e0245e' },
    link: { color: '#4f6df5', fontSize: 14 },
});
