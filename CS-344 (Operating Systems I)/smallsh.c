/**
 * @author Matthew Walker
 * @brief Assignment 3 Smallsh 
 * @date 10/26/2022
*/

// Add includes as needed
#include <fcntl.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include "small.h"

// // setting up boolean values
// #define TRUE 1
// #define FALSE 0

// Have a set number to represent an empty PID spot in background PID array
#define EMPTPID -8
#define PIDARSIZE 200

/// @brief This typedef is used to more easily represent type _Bool as bool.
typedef _Bool bool;

// Adding these sigaction structs as global variables so they can be accessed throughout the program
struct sigaction SIGINT_action = {0}, SIGTSTP_action = {0};
bool BACKGROUND_OFF = FALSE;

// Setup global variables for use in status 
/* 
 * This could be made into struct object to be passed into status but the current method will do for now 
 * (Could do status struct declare in main and update and pass it to exec in loop)
*/
bool EXITSTATUS = TRUE;
int EXITVALUE = 0;

int main()
{
	// Use stdlib printf and such in main and save write and read for signals and the like

	int backgndPIDs[PIDARSIZE];
	// initializing array elements
    for (int i = 0; i < PIDARSIZE; i++)
	{
        backgndPIDs[i] = EMPTPID;
    }

	// Only need to setup SIGTSTP handling once becuse no changing later will occur
	SIGTSTP_action.sa_handler = readonly;

	// For some reason the system fails and exits from the main shell if this particular flag isn't set?
	SIGTSTP_action.sa_flags = SA_RESTART;
	// SIGTSTP_action.sa_flags = 0;
	sigaction(SIGTSTP, &SIGTSTP_action, NULL);

	// Use this bool to loop through main part of the shell
	bool exitRecieved = FALSE;

	// Setting up variables to use getline for user input
	char* currLine = NULL;
	size_t len = 0, nread = -1; 

	// Below is not required for the script but I find it nice and useful
	// pid_t pid = getpid();
	// printf("PID: %d\n\n", pid);

	// Enter the main parent part of the shell
	while(!exitRecieved)
	{
		// The shell should Ignore SIGINT only foreground child should recieve them.
		SIGINT_action.sa_handler = SIG_IGN;

		// This says to block all catchable signals while SIG_IGN is running
		sigfillset(&SIGINT_action.sa_mask);
		SIGINT_action.sa_flags = 0;
		sigaction(SIGINT, &SIGINT_action, NULL);

		// At the begining before prompting user for more input check if any child processes finished and need to be cleaned
		checkChildren(backgndPIDs, PIDARSIZE, EMPTPID, FALSE);

		// Print the terminal and get input from user
		printf(": "); fflush(stdout);
		nread = getline(&currLine, &len, stdin);

		if(nread == -1)
		{
			// There is sometimes an error with getline and SIGTSTP so need to clean stdin and remove errors
			clearerr(stdin);
			free(currLine);
			currLine = NULL;
			continue;
		}
		
		// Ignore comment and blank lines
		if(nread == 1 || currLine[0] == '#')
		{
			continue;
		}

		// Need to remove the '\n' character grabbed by getline()
		if(nread > 0)
		{
			if(currLine[nread - 1] == '\n')
			{
				currLine[nread - 1] = '\0';
			}
		}

		// Create a command line struct object based on the user input provided it's nut a line full of spaces
		struct commandLine* cmdLine = parseCmdInput(currLine);
		if(cmdLine == NULL)
		{
			continue;
		}

		// printCmdInput(cmdLine);

		char* command = cmdLine->command;
		
		// Time to check the command and see if it is one of the manually implemented ones or if it is to handed off to child process
		if(!strcmp(command,"exit"))
		{
			// Manually kill all background children and clean up all processes and allocated memory
			checkChildren(backgndPIDs, PIDARSIZE, EMPTPID, TRUE);
			free(currLine);
			freeCmd(cmdLine);

			// Set exit recieved to yes to end loop and finish the program
			exitRecieved = TRUE;
			continue;
		}
		else if(!strcmp(command,"cd"))
		{
			// if command cd is received then there must be at least one Aurgument and the next will be NULL or hopefully a good directory
			cd(cmdLine->argv[1]);
		}
		else if(!strcmp(command, "status"))
		{
			// Check the exit value and status of the last run foreground progress
			status();
		}
		else
		{
			// Time to hand off to execvp()
			execute(cmdLine, backgndPIDs);
		}
		
		// Free up allocated memories and set currLine NULL for next run of getline
		free(currLine);
		freeCmd(cmdLine);
		currLine = NULL;
	}
	return 0;
} 

bool argParser(struct commandLine* cmd, char* lineInput)
{
	// Seting up logic and returning variables
	bool parseSuccess = TRUE;
	char* saveptr;

	// Need to setup and do a bit of math based on any special contents in lineInput
	int numWords = countWords(lineInput);
	int numPids = countOccurence(lineInput, "$$");
	int stdIn = countOccurence(lineInput, "<");
	int stdOut = countOccurence(lineInput, ">");

	// This calculates the number of words to be storing in argv any stdIn or out will take the > character and file name out of the string
	numWords -= ((stdIn + stdOut) * 2);

	// Set up the maximum length that a string could be if all the PID's are expanded.
	size_t maxSize = (numPids * 8) + (strlen(lineInput) + 1); 

	// Time to set up cmd object
	cmd->argv = malloc(sizeof(char*) * (numWords + 1));
	cmd->stdinfile = NULL;
	cmd->stdoutfile = NULL;
	cmd->background = FALSE;

	// Need to set up possible string for expansion and the token holder
	char* expString = calloc(maxSize, sizeof(char)); 
	char* tok = NULL;

	if(numPids > 0)
	{
		// There are some PID's that need to be included so prepare and expand the string
		memset(expString, '\0', sizeof(expString));
		strcpy(expString, lineInput);
		expand(expString);

		// Now that the string is expanded we will use this one to parse from
		tok = strtok_r(expString, " ", &saveptr);
	}
	else
	{
		// There weren't any PID's so just use the initally given input as is
		tok = strtok_r(lineInput, " ", &saveptr);
	}
	
	// Looks like we were given a line with spaces or something
	if(tok == NULL)
	{
		// Free up allocated memory and return that argParser didn't have anything to parse (NULL)
		free(expString);
		bool parseSuccess = FALSE;
		free(cmd->argv);
		return parseSuccess;
	}

	// Time to run through and parse the line input into argv in the struct
	int null_count = 0;
    for(int i = 0; tok != NULL;)
    {
		size_t len = 0;

		// These are supposed to appear after all arguments so if need be have argv stop and read the last bits into the stds
		if(!strcmp(tok, "<"))
		{
			// Parse the word into stdinfile redirection name and move on to the next word
			tok = strtok_r(NULL, " ", &saveptr);
			cmd->stdinfile = parseWord(tok); 
			tok = strtok_r(NULL, " ", &saveptr);
		}
		else if(!strcmp(tok, ">"))
		{
			// Parse the word into stdoutfile redirection name
			tok = strtok_r(NULL, " ", &saveptr);

			// This system will fail badly if no word after > or < I don't do any checking and handling
			cmd->stdoutfile = parseWord(tok); 
			tok = strtok_r(NULL, " ", &saveptr);
		}
		else if(!strcmp(tok, "&") && i == numWords - 1) // Need to make sure "&" is last word for background processes
		{
			// If & is the last command then this should be a background process under normal circumstances
			cmd->background = TRUE;
			// Unclear as to what to do with & if background off is on so just ignore it
			// if(BACKGROUND_OFF)
			// {
			// 	cmd->argv[i] = parseWord("&"); 
			// 	null_count++;	
			// }
			// null_count++;
			break;
		}
		else
		{
			// Regular command that will be stored into argv[]
			cmd->argv[i] = parseWord(tok); 
        	tok = strtok_r(NULL, " ", &saveptr);

			null_count++;
			i++;
		}

    }

	// Make sure last word is NULL so that it can be tracked in formulas accurately
	cmd->argv[null_count] = NULL;
	cmd->command = cmd->argv[0];

	// Clean up memory allocated for the expanded string
	free(expString);
	return parseSuccess;
}

void expand(char* expandString)
{
	/**
	 * @note Inspiration for some of the code developed in this function has been adapted from the cited resource below.
	 * @cite https://www.geeksforgeeks.org/c-program-replace-word-text-another-given-word/
	 * @author GeeksForGeeks
	*/

	// Setting up necessary containers and values to use through the function
	pid_t pid = getpid();
	int position = 0;
	bool EndReached = FALSE;

	while(!EndReached)
	{
		// Get the position of the first occurence of $$ (will replace each time)
		char* result = strstr(expandString, "$$");
		if(result == NULL)
		{
			// There are no longer any $$ in the string
			EndReached = TRUE;
			break;
		}
		else
		{
			// Get the position to stop at the prefix and to star the suffix ignoring the 2 characters $$
			int startPos = result - expandString; 
			position = startPos + 2;

			// Set up prefix and suffix with plenty of room for the string to parse
			char prefix[strlen(expandString)+1], suffix[strlen(expandString)+1];
			memset(prefix, '\0', sizeof(prefix));
			memset(suffix, '\0', sizeof(suffix));

			// Need to copy in both sides of the string excluding $$ and replacing with pid
			strncpy(prefix, expandString, startPos);
			strncpy(suffix, &expandString[position], strlen(&expandString[position]));
			prefix[startPos] = '\0';
			
			// Could use these instead of srncpy(), strncpy() worked better so used those
			// memcpy(prefix, expandString, startPos);
			// memcpy(suffix, &expandString[position], strlen(&expandString[position]));

			// Reformat the string replacing a $$ with pid
			sprintf(expandString, "%s%d%s", prefix, pid, suffix);
		}
	}
}

int countOccurence(const char* checkString, const char* subString)
{
	// Getting containers and the return value set up to track
	int position = 0, repCount = 0;
	bool EndReached = FALSE;

	while(!EndReached)
	{
		// Check for the first instance of subString from the rest of the string starting at position
		char* result = strstr(&checkString[position], subString);
		if(result == NULL)
		{
			EndReached = TRUE;
		}
		else
		{
			// An instance of the subtring as been found increase the count and change the starting position
			int startPos = result - checkString; 
			position = startPos + strlen(subString);
			repCount++;
		}
	}

	return repCount;
}

void status()
{
	// Check whether the last foreground process was exited regularly or via a signal and print the value
	if(EXITSTATUS)
		printf("exit value %i\n", EXITVALUE);
	else
		printf("terminated by signal %i\n", EXITVALUE);
	
	fflush(stdout);
}

void cd(const char* nextDir)
{
	// Declare a buffer to read the current directory and set up result handler
	char curWD[4000];
	int cdRes = -5;

	// Need to change directory to HOME or argument provided
	if(nextDir == NULL)
		cdRes = chdir(getenv("HOME"));
	else
		cdRes = chdir(nextDir);

	// Need to check and make sure chdir didn't fail
	if(cdRes < 0)
	{
		perror("chdir() failed");
	}
}

int countWords(const char* cString)
{
	// Manually go through the string searching for all of the spaces before words
	int total = 0;
	for(int i = 0; cString[i] != '\0'; i++)
	{
		// First check for empty space at the begining and remove it
		if(i == 0 && cString[i] == ' ')
		{
			while (cString[i] == ' ')
			{
				i++;
			}
		}

		// If the character is currently a space and the next character is not a space and not the end found a new word
		if(cString[i] == ' ' && (cString[i+1] != ' ' && cString[i+1] != '\0'))
		{
			total++;
		}
	}
	// Number of blank spaces counted the words will be one more
	return total + 1;
}

void freeCmd(struct commandLine* cmd)
{
	// This takes care of both argv and command
	for(int i = 0; cmd->argv[i] != NULL; i++)
	{
		free(cmd->argv[i]);
	}
	// Free the rest of the possibly allocated fields
	free(cmd->argv);
	free(cmd->stdinfile);
	free(cmd->stdoutfile);
	free(cmd);
}

struct commandLine* parseCmdInput(char* lineInput)
{
	// Setup space for the commandLine object, if argParser returns false there is no input free up space and return null
	struct commandLine* cmd = malloc(sizeof(struct commandLine));
	if(argParser(cmd, lineInput))
		return cmd;
	
	free(cmd);
	return NULL;
}

char* parseWord(const char* word)
{
	// Need to allocate the length for the word
	size_t len = strlen(word);
	char* rWord = calloc(len + 1, sizeof(char));
	strcpy(rWord, word);

	// Make sure the ending of the string is null-terminated and return the new allocated word
	rWord[len] = '\0';
	return rWord;
}

void addBackgnPID(int pidArray[], int arrSize, int emptyTerm, int PID)
{
	// Go through and add PID to first empty spot in pidArray
	for(int i = 0; i < arrSize; i++)
	{
		if(pidArray[i] == emptyTerm)
		{
			pidArray[i] = PID;
			break;
		}
	}
}

void printBackgndPID(int pidArray[])
{
    // Debugging function for use to see the background PID's currently in the array
	for(int i = 0; i < PIDARSIZE; i++)
	{
		if(pidArray[i] != EMPTPID)
			printf("Array[%i]: %i\n", i, pidArray[i]);
	}
}

void checkChildren(int backPIDs[], int arrSize, int emptyTerm,  bool killC)
{
	// Need to setup information handlers to pass around
	int childExitMethod = 0;
	pid_t childPid = 0;

	for(int i = 0; i < arrSize; i++)
	{
		// If it is not a PID then it is time to move on
		if(backPIDs[i] == emptyTerm)
		{
			continue;
		}

		// If this is being called with killC enabled then it is time to kill and clean up all children manually
		if(killC)
		{
			// Put cleaning signal kill attempt in a loop to try and kill/signal bomb up to 50 times usally doesn't fail once 
			for(int kAttempt = 0, kVal = 0; (kVal = kill(backPIDs[i], 15)) < 0 && (kAttempt < 50); kAttempt++){}

			// Now reap the children that should definitely be dead
			childPid = waitpid(backPIDs[i], &childExitMethod, 0);
		}
		else
		{
			// If not trying to kill off just check the background processes to see if any are ready for reaping
			childPid = waitpid(backPIDs[i], &childExitMethod, WNOHANG);
		}

		// A process has been cleaned up with wait let the user know
		if(childPid > 0)
		{
			bool normExit = TRUE;
			int signal = 0;

			// Check the exit type and signal value
			if(WIFEXITED(childExitMethod))
			{
				signal = WEXITSTATUS(childExitMethod);
			}
			else if(WIFSIGNALED(childExitMethod))
			{
				normExit = FALSE;
				signal = WTERMSIG(childExitMethod);
			}

			// Since we aren't exiting and killing off all processes let the user know which process was exited and how
			if(!killC)
			{
				printf("background pid %d is done: ", backPIDs[i]);
				normExit ? printf("exit value %i\n", signal) : printf("terminated by signal %i\n", signal) ;
				fflush(stdout);
			}
			// Remove the PID from the background PID array and make room for new ones
			backPIDs[i] = emptyTerm;
		}
		// else: background process is still runing at this time
	}
}

void readonly(int signo)
{
	BACKGROUND_OFF ? (BACKGROUND_OFF = FALSE) : (BACKGROUND_OFF = TRUE);
	BACKGROUND_OFF ? write(STDOUT_FILENO, "\nEntering foreground-only mode (& is now ignored)\n: ", 53) : write(STDOUT_FILENO, "\nExiting foreground-only mode\n: ", 33);
	clearerr(stdin);
}

void execute(struct commandLine* cmd, int backgndPIDArray[])
{
	// Code heavily inspired from Lec 3.1 Processes!

	pid_t spawnPid = -5;
	int childExitMethod = -5;
	
	// Setting up file descripters and result ints to make sure the files are redirected correctly
	int stdinFD = 0, stdoutFD = 0, result = 0;
	spawnPid = fork();
	switch (spawnPid) 
	{
		case -1: 
			perror("Hull Breach!\n"); 
			exit(1); 
			break;
		case 0: 
			// Check to see if there is a file to redirect to stdin before exec
			if(cmd->stdinfile != NULL)
			{
				stdinFD = open(cmd->stdinfile, O_RDONLY);
				if (stdinFD == -1) 
				{ 
					perror("source open()");
					exit(1); 
				}
				
				// Redirect stdin to the given file with readonly permission
				result = dup2(stdinFD, 0);
				if (result == -1) 
				{ 
					perror("source dup2()");
					exit(1); 
				}
			}
			else if(cmd->background)
			{
				// If there is no stdin redirection file and it is a background process redirect to /dev/null
				stdinFD = open("/dev/null", O_RDONLY);
				if (stdinFD == -1) 
				{ 
					perror("source open()");
					exit(1); 
				}
				result = dup2(stdinFD, 0);
				if (result == -1) 
				{ 
					perror("source dup2()");
					exit(1); 
				}
			}

			// Check to see if there is a file to redirect to stdout before exec
			if(cmd->stdoutfile != NULL)
			{
				// Attempt to open the file with truncation and some good general permissions
				stdoutFD = open(cmd->stdoutfile, O_WRONLY | O_CREAT | O_TRUNC, 0644);
				if (stdoutFD == -1) 
				{ 
					perror("target open()");
					exit(1); 
				}

				// Redirect stdout to the given file with truncation and some good general permissions
				result = dup2(stdoutFD, 1);
				if (result == -1) 
				{ 
					perror("target dup2()"); 
					exit(1); 
				}
			}
			else if(cmd->background)
			{
				// If there is no stdout redirection file and it is a background process redirect to /dev/null
				stdoutFD = open("/dev/null", O_WRONLY | O_CREAT | O_TRUNC, 0644);
				if (stdoutFD == -1) 
				{ 
					perror("target open()");
					exit(1); 
				}

				result = dup2(stdoutFD, 1);
				if (result == -1) 
				{ 
					perror("target dup2()"); 
					exit(1); 
				}
			}

			// If process is forground or foreground only is on need to make it respond to SIGINT
			if(!cmd->background || BACKGROUND_OFF)
			{
				SIGINT_action.sa_handler = SIG_DFL;
				// Redeclaring below may be unecessary but doesn't hurt
				// This says to block all catchable signals while SIG_IGN is running
				sigfillset(&SIGINT_action.sa_mask);
				SIGINT_action.sa_flags = 0;
				sigaction(SIGINT, &SIGINT_action, NULL);
			}

			execvp(*cmd->argv, cmd->argv);

			// This is only reached when exec fails. Not sure which error message is better
			// perror("CHILD: exec failure!\n");
			perror("badfile");
			exit(1); 
			break;
		
		default:
			// If the pid is not -1 or 0 it is in the parent process

			// If a forground process or foreground only on wait for child to be finished
			if(!cmd->background || BACKGROUND_OFF)
			{
				// Foreground process should wait until child is finished and clean it up
				if(waitpid(spawnPid, &childExitMethod, 0) == -1)
				{
					perror("Wait() failed");
					exit(1);
				}
				
				// Now check the exit method and status and set the global variables that status uses
				if(WIFEXITED(childExitMethod))
				{
					// Exited normally set value and status
					int exitStatus = WEXITSTATUS(childExitMethod);
					EXITSTATUS = TRUE;
					EXITVALUE = exitStatus;
				}
				else if(WIFSIGNALED(childExitMethod))
				{
					// Exited via a signal record value and tell user that signal has cancelled process
					EXITSTATUS = FALSE;
					int termSignal = WTERMSIG(childExitMethod);
					EXITVALUE = termSignal;
					printf("terminated by signal %d\n", termSignal);
				}
				else{} // Should never reach here
			}
			else if(cmd->background && BACKGROUND_OFF == FALSE)
			{
				// Add the spawn pid's to an array to keep track of to kill off processes if need be.
				addBackgnPID(backgndPIDArray, PIDARSIZE, EMPTPID, spawnPid);
				// printBackgndPID(backgndPIDArray);
				printf("Background pid is %d\n", spawnPid); fflush(stdout);
			}
			break;
	}
}
