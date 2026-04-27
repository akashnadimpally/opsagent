using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace K8sOpsAgent.UI.Shared
{
    public class ChatViewModel : INotifyPropertyChanged
    {
        private string _userInput;
        private ObservableCollection<string> _messages;

        public ChatViewModel()
        {
            Messages = new ObservableCollection<string>();
            SendCommand = new RelayCommand(SendMessage);
        }

        public ObservableCollection<string> Messages
        {
            get => _messages;
            set
            {
                _messages = value;
                OnPropertyChanged();
            }
        }

        public string UserInput
        {
            get => _userInput;
            set
            {
                _userInput = value;
                OnPropertyChanged();
            }
        }

        public ICommand SendCommand { get; }

        private void SendMessage()
        {
            if (!string.IsNullOrWhiteSpace(UserInput))
            {
                Messages.Add($"User: {UserInput}");
                // Here you would call the method to send the UserInput to the agent and get a response
                // For example: var response = await agent.SendMessage(UserInput);
                // Messages.Add($"Agent: {response}");
                UserInput = string.Empty; // Clear the input after sending
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class RelayCommand : ICommand
    {
        private readonly Action _execute;
        private readonly Func<bool> _canExecute;

        public RelayCommand(Action execute, Func<bool> canExecute = null)
        {
            _execute = execute;
            _canExecute = canExecute;
        }

        public event EventHandler CanExecuteChanged;

        public bool CanExecute(object parameter) => _canExecute == null || _canExecute();

        public void Execute(object parameter) => _execute();

        public void RaiseCanExecuteChanged() => CanExecuteChanged?.Invoke(this, EventArgs.Empty);
    }
}