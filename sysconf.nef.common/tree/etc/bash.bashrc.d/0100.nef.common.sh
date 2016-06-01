# Common bash.bashrc code (sysconf.nef.common)          -*- shell-script -*-
#
# /etc/profile  -  Fichier de demarrage du bash interactif
#		   commun à tous les utilisateurs
#
# Créé en Janvier 2002 par Jean-François Gigand
#

# Fonctions

#source /usr/share/emacs/current/etc/emacs.bash

################################################################################
## FROM Ubuntu ~root/.bashrc:

# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do anything
[ -z "$PS1" ] && return

# don't put duplicate lines in the history. See bash(1) for more options
# ... or force ignoredups and ignorespace
HISTCONTROL=ignoredups:ignorespace

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "$debian_chroot" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
    xterm-color) color_prompt=yes;;
esac

# uncomment for a colored prompt, if the terminal has the capability; turned
# off by default to not distract the user: the focus in a terminal window
# should be on the output of commands, not on the prompt
#force_color_prompt=yes

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
	# We have color support; assume it's compliant with Ecma-48
	# (ISO/IEC-6429). (Lack of such support is extremely rare, and such
	# a case would tend to support setf rather than setaf.)
	color_prompt=yes
    else
	color_prompt=
    fi
fi

if [ "$color_prompt" = yes ]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
    ;;
*)
    ;;
esac

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    #alias dir='dir --color=auto'
    #alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

################################################################################

# Shell prompt and options
################

export HISTTIMEFORMAT='%F %T '
export MC_SKIN=dark

# set a fancy prompt
case "$TERM" in
        # xterm-color)
xterm*)
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\H\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
    ;;
*)
    PS1='${debian_chroot:+($debian_chroot)}\u@\H:\w\$ '
    ;;
esac

shopt -s dirspell  # corrections mineures auto pour autocompl des rep.
#shopt -s failglob  # erreur si glob ne trouve pas de fichier
shopt -s globstar  # autoriser les "**"
shopt -s histverify
shopt -s hostcomplete
# extglob(on) force_ignore(on) FIGNORE
# nullglob

#. /etc/bash_completion
# Source http://blog.lefebvrepe.com/post/2008/05/08/Centos-5:-Activer-lauto-completion
# enable custom tab completion
#shopt -s progcomp


# Aliases / helper functions
################

alias l='ls -lh --color=auto'
alias df="df -h"
alias pstree="pstree -hGncp"
alias ps="ps aux"
alias dus='du -x 2>/dev/null | grep -v ".*/.*/.*" | sort -n'
alias xls='lxc-ls -f'
xstart() {
    lxc-start -d -n "$1"
    sleep 1
    lxc-info -n "$1"
    xat "$1"
}
xstop() {
    lxc-stop -n "$1"
    sleep 1
    lxc-info -n "$1"
}
xat() {
    lxc-attach --clear-env -n "$1" -- env USER=root HOME=/root TERM="$TERM" bash -l
}
alias gt='git ted'
