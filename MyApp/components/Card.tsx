import { ActivityIndicator, Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import React from 'react';
import AuthorRow, { type AuthorRowProps } from './AuthorRow';

interface CardProps {
    authorProps: AuthorRowProps;
    image: ImageSourcePropType;
    imageAspectRatio?: number;
}

export default class Card extends React.Component<CardProps> {
    static defaultProps = {
        linkText: '',
        onPressLinkText: () => { },
    };

    state = {
        loading: true,
    };

    handleLoad = () => {
        this.setState({ loading: false });
    };

    render() {
        const {
            authorProps,
            image,
            imageAspectRatio = 1,
        } = this.props;

        const { loading } = this.state;

        return (
            <View style={styles.container}>
                <AuthorRow
                    fullName={authorProps.fullName}
                    linkText={authorProps.linkText}
                    onPressLinkText={authorProps.onPressLinkText}
                />
                <View style={[styles.image, { aspectRatio: imageAspectRatio }]}>
                    {loading && (
                        <ActivityIndicator style={StyleSheet.absoluteFill} size={'large'} />
                    )}
                    <Image
                        style={StyleSheet.absoluteFill}
                        source={image}
                        resizeMode="contain"
                        onLoad={this.handleLoad}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
    },
});
