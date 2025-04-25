document.addEventListener('DOMContentLoaded', function () {
    const themeSwitcher = document.getElementById('theme-switcher');
    const themeLink = document.getElementById('theme-style');

    // Define the paths to your themes
    const lightTheme = 'css/style1.css';
    const darkTheme = 'css/style2.css';

    // Check saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        themeLink.setAttribute('href', darkTheme);
    } else {
        themeLink.setAttribute('href', lightTheme);
    }

    themeSwitcher.addEventListener('click', function () {
        const currentTheme = themeLink.getAttribute('href');

        if (currentTheme.includes('style1.css')) {
            themeLink.setAttribute('href', darkTheme);
            localStorage.setItem('theme', 'dark');
        } else {
            themeLink.setAttribute('href', lightTheme);
            localStorage.setItem('theme', 'light');
        }
    });
});
// JavaScript Document