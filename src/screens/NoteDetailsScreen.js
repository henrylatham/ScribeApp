import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
    ScrollView,
    Picker
} from 'react-native';
import Loading from './Loading';
import theme from '../theme';

//BEGIN-REDUX
import { connect } from 'react-redux';
import actions from '../redux/actions';
// END-REDUX

// Stylesheet for the details page
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        backgroundColor: 'white',
    },
    fieldTitle: {
        color: '#353535',
        fontSize: 10
    },
    fieldContainer: {
        paddingTop: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 0,
        fontSize: 32
    },
    contentContainer: {
        flexGrow: 1
    },
    infoContainer: {

    },
    titleInput: {
        borderBottomWidth: 1,
        borderBottomColor: theme.fieldIdColor,
        fontSize: 24,
        paddingTop: 16,
    },
    bodyInput: {
      fontSize: 14,
      marginBottom: 264,
    },

    ratingSection: {
      flex: 1,
      flexDirection: 'row',
      width: '100%',
      backgroundColor: 'white',
    },

    ratingPicker: {
      width: 64,
      height: 24,
      textAlign:'center',
    },

    ratingItem: {
      fontSize: 12,
      borderRadius: 2,
      borderWidth: 1,
      borderColor: '#C2BCC5',
      backgroundColor: '#FAFAFA',
      height: 40,
    },

    ratingContainer: {
      width: 80,
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: 16,
      marginRight: 16,
      marginBottom: 32,
    },

    infoText: {
        fontSize: 10,
        color: '#808080'
    },

    wordCountText: {
        fontSize: 14,
        marginRight: 16
    },

    wordCountReached: {
        color: 'green'
    }
});

/**
 * Component for displaying the details of the specified note
 *
 * @class NoteDetails
 * @extends {React.Component}
 */
class NoteDetails extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { state } = navigation;
        const wordCount = state.params && state.params.wordCount || 0;
        const reachedCount = wordCount && wordCount > 250;

        return {
            /**title:'Note Details',*/
            headerStyle: {
                backgroundColor: theme.headerBackgroundColor
            },
            headerTintColor: theme.actionButtonColor,
            headerRight: (
                <Text style={[ styles.wordCountText, reachedCount && styles.wordCountReached ]}>
                    { wordCount } / 250
                </Text>
            )
        }
    }
    /**
     * Constructor - loads the note from the store.
     *
     * @param {Props} props properties for this component
     * @memberof NoteDetails
     */
    constructor(props) {
        super(props);
        this.state = {
            note: props.note || this.blankNote(props.navigation.state.params.noteId)
        }
    }

    componentDidMount() {
        // update word count
        this.updateWordCount(this.state.note.content)
    }

    /**
     * Creates a blank note
     *
     * @param {String} id the ID of the new note
     */
    blankNote(id) {
        return {
            noteId: id,
            title: '',
            content: ''
        };
    }

    /**
     * Updates a field in the note
     *
     * @param {String} text the text content of the field
     * @param {String} field the name of the field
     * @memberof NoteDetails
     */
    onChangeField(text, field) {
        const note = Object.assign({}, this.state.note);    // turn state into a mutable object
        note[field] = text;
        this.setState({ note });
    }

    /**
     * update word count in title
     * @param {string} text
     */
    updateWordCount(text) {
        const matches =  text.match(/\S+/g);
        const count = matches ? matches.length : 0;
        this.props.navigation.setParams({ wordCount: count });
    }


    /** Set rating default */
    handleChangeOption(val) {
      if (val !== 0) {
        this.setState({selectedValue: val});
      }
    }

    /**
     * React lifecycle method that is called when the view is closed.  This will
     * be called both when the user presses the Back button and when the application
     * is closed on the screen.  Used to save the note
     * @memberof NoteDetails
     */
    componentWillUnmount() {
        const note = Object.assign({}, this.state.note);  // turn state into a mutable object
        // DynamoDB does not allow zero-length fields
        if (note.title.length === 0) { note.title = ' '; }
        if (note.content.length === 0) { note.content = ' '; }

        // now save the note
        this.props.saveNote(this.state.note);
    }

    /**
     * React lifecycle method that is called when the view needs to be rendered
     * @memberof NoteDetails
     */
    render() {
        const textFieldParams = {
            style: styles.textInput,
            /*underlineColorAndroid: 'rgba(0,0,0,0)',*/
            placeholderTextColor: '#C2BCC5',
        };

        if (this.props.loading) {
            return <Loading/>;
        }

        return (
            <ScrollView style={styles.container}>
                <View style={styles.fieldContainer}>
                    <TextInput {...textFieldParams}
                        style={styles.titleInput}
                        autoCapitalize="words"
                        onChangeText={text => this.onChangeField(text, 'title')}
                        placeholder="Why do you journal?"
                        value={this.state.note.title} />
                </View>
                <View style={[styles.fieldContainer, styles.contentContainer]}>
                    <TextInput {...textFieldParams}
                        style={styles.bodyInput}
                        autoCapitalize="sentences"
                        onChangeText={text => {
                            this.onChangeField(text, 'content');
                            this.updateWordCount(text);
                        }}
                        placeholder="Write Here"
                        multiline={true}
                        value={this.state.note.content} />
                </View>
                <View style={styles.ratingSection}>
                  <View style={[styles.fieldContainer, styles.ratingContainer]}>
                      <Text>Mood:</Text>
                      <Picker
                        selectedValue={this.state.rating}
                        style={styles.ratingPicker}
                        itemStyle={styles.ratingItem}
                        onValueChange={this.handleChangeOption}
                        >
                          <Picker.Item label="Select" style={{opacity: 0.54,}} value="0" />
                          <Picker.Item label=":(" value="1" />
                          <Picker.Item label=":|" value="2" />
                          <Picker.Item label=":)" value="3" />
                      </Picker>
                  </View>

                </View>
            </ScrollView>
        );
    }
}

// BEGIN-REDUX
/**
 * Maps the redux store state to properties required by this container
 * component.  In this case, we only want to see the records that are
 * not deleted.
 *
 * @param {Object} state the redux store state
 */
const mapStateToProps = (state, ownProps) => {
    return {
        note: state.notes.find(n => n.noteId === ownProps.navigation.state.params.noteId)
    };
};

/**
 * Maps the dispatch method to dispatch the appropriate actions based
 * on the events that will be generated by this container component.
 *
 * @param {Function} dispatch the dispatcher from redux
 */
const mapDispatchToProps = (dispatch) => {
    return {
        saveNote: (note) => dispatch(actions.notes.saveNote(note))
    };
};
const NoteDetailsScreen = connect(mapStateToProps, mapDispatchToProps)(NoteDetails);
// END-REDUX

export default NoteDetailsScreen;
