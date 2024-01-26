#ifndef SMALL_H_   /* Double include guard */
#define SMALL_H_

// Use for pid_t type
// #include <sys/types.h>

// setting up boolean values
#define TRUE 1
#define FALSE 0

/// @brief This typedef is used to more easily represent type _Bool as bool.
typedef _Bool bool;

/// @brief Struct to hold entered command line information.
struct commandLine
{
	/// @brief This points to argv[0] which is the command entered.
	char* command;
	/// @brief The array of string aurguments to hold.
	char** argv;

	// Could be useful but in the end didn't use for this implementation
	// int argc; 

	/// @brief File name for stdin redireciton (NULL) if nothing.
	char* stdinfile;
	/// @brief File name for stdout redirection (NULL) if nothing.
	char* stdoutfile;
	/// @brief Bool that represents wether it is a background process or not.
	bool background;
};

/** 
 * @brief Takes a char buffer with PID strings "$$" and expands all of them to the proper PID.
 * @param expandString String buffer with information to parse "$$" and expand to PID.
 */
void expand(char* expandString);

/** 
 * @brief Handling the functionality of linux cd manually. 
 * Can take one argument of directory to change to if none provided will direct to HOME directory.
 * @param nextDir The name of the directory to change to or NULL if cd called with no arguments.
*/ 
void cd(const char* nextDir);

/**
 * @brief Simple function to print commandLine for debugging purposes.
 * @param cmd The commandLine struct object to read from.
*/
void printCmdInput(struct commandLine* cmd);

// Probably not the exact order I had in mind

/**
 * @brief Returns exit value and status of the most recently finished foreground process.
*/ 
void status();

/** 
 * @brief Helper function used in argParser to parse and return a word in a specific way that is used multiple times.
 * @param word The constant string that holds the word to parse (but not tamper with).
 * @return A pointer to an allocated and parsed word ready for storing.
*/  
char* parseWord(const char* word);

void printBackgndPID(int pidArray[]);

/** 
 * @brief Takes an integer array to store background PID's in and add's the specified PID to the first available location.
 * @param pidArray An integer array used to store the background PID's.
 * @param arrSize The total size of the array passed in.
 * @param emptyTerm The integer value that represents "empty" where a new value can be inserted for this string.
 * @param PID The specific PID of the background process to store into the array.
*/ 
void addBackgnPID(int pidArray[], int arrSize, int emptyTerm, int PID);

/** 
 * @brief Searches a string for the number of occurences of a specified sub string.
 * @param checkString The string to search the number of subStrings from.
 * @param subString The substring to search for and count.
 * @return An integer representing how many times subString is present in checkString.
*/ 
int countOccurence(const char* checkString, const char* subString);

/**
 * @brief Takes a string and checks the number of words in it without modifying anything in the string.
 * @param cString The constant char* (string) to read the number of words from and not change. 
 * @return An integer representing the number of words found in the provided string.
 */
int countWords(const char* cString);

/** 
 * @brief Takes a commandLine struct object and parses and sets up all of it's data and returns a bool of wether it was successful.
 * @param cmd The commandLine struct object to instantiate and fill with data.
 * @param lineInput The line input that the user has provided from stdin.
 * @return A boolean true value if it could parse the input and false if there wasn't anything to properly parse.
*/ 
bool argParser(struct commandLine* cmd, char* lineInput);

/**
 * @brief Takes a line of input received from stdin via getline and allocates a commandLine object and returns the pointer to it.
 * @param lineInput The string of input received from stdin via getline().
 * @return The pointer of an allocated commandLine struct object that holds aurguments to use in other functions or NULL if parsing failed.
*/ 
struct commandLine* parseCmdInput(char* lineInput);

/** 
 * @brief Goes through and manually frees the memory allocated for a commandLine struct object.
 * @param cmd The commandLine struct object to clean up and free.
*/  
void freeCmd(struct commandLine* cmd);

/**
 * @brief The function that sets the mode to (read-only) by making all processes foreground when recieving SIGTSTP.
 * @param signo An integer that sa_handler has in its struct pointer to function definition (Not utilized in the function).
*/
void readonly(int signo);

/** 
 * @brief This function handles running shell commands that haven't been specifically implemented.
 * @param cmd A commandLine struct with all the necessary information to hand off the commands.
 * @param backgndPIDArray The integer array in which to store the PID of any background processes created.
*/
void execute(struct commandLine* cmd, int backgndPIDArray[]);

/** 
 * @brief Checks through the list of children to get which ones finished or kills them and cleans them up depending on the bool value kill.
 * @param backPIDs The array that stores the list of background PIDs.
 * @param arrSize The total size of the array passed in.
 * @param emptyTerm The integer value that represents "empty" where a new value can be inserted for this string.
 * @param killC A boolean value true means to kill and wait on all children otherwise just check to see which have finished.
*/ 
void checkChildren(int backPIDs[], int arrSize, int emptyTerm,  bool killC);

#endif // SMALL_H_