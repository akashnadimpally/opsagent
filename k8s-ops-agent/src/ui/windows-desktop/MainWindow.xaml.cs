using System.Windows;

namespace K8sOpsAgent.UI.WindowsDesktop
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            DataContext = new ChatViewModel();
        }

        private void SendButton_Click(object sender, RoutedEventArgs e)
        {
            var viewModel = DataContext as ChatViewModel;
            if (viewModel != null)
            {
                viewModel.SendMessage();
            }
        }

        private void InputTextBox_KeyDown(object sender, System.Windows.Input.KeyEventArgs e)
        {
            if (e.Key == System.Windows.Input.Key.Enter)
            {
                SendButton_Click(sender, e);
                e.Handled = true;
            }
        }
    }
}