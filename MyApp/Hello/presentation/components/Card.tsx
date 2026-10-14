import { ActivityIndicator, Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import AuthorRow, { type AuthorRowProps } from './AuthorRow';

interface CardProps {
    authorProps: AuthorRowProps;
    image: ImageSourcePropType;
    imageAspectRatio?: number;
    onPress?: () => void;
}

export default class Card extends React.Component<CardProps> {
    override state = {
        loading: true,
    };

    handleLoad = () => {
        this.setState({ loading: false });
    };

    override render() {
        const {
            authorProps,
            image,
            imageAspectRatio = 1,
            onPress,
        } = this.props;

        const { loading } = this.state;

        return (
            <View style={styles.container}>
                <AuthorRow
                    fullName={authorProps.fullName}
                    linkText={authorProps.linkText}
                    onPressLinkText={authorProps.onPressLinkText}
                    isFavorite={authorProps.isFavorite}
                    onToggleFavorite={authorProps.onToggleFavorite}
                />
                <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.image}>
                    <View style={{ aspectRatio: imageAspectRatio }}>
                        {loading && (
                            <ActivityIndicator style={StyleSheet.absoluteFill} size={'large'} />
                        )}
                        <Image
                            style={StyleSheet.absoluteFill}
                            source={image}
                            resizeMode="cover"
                            onLoad={this.handleLoad}
                        />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    image: {
        width: '100%',
        backgroundColor: '#eee',
    },
});
